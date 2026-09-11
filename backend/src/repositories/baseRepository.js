const mongoose = require('mongoose');
const crypto = require('crypto');
const logger = require('../utils/logger');

class BaseRepository {
  constructor(model, modelName) {
    this.model = model;
    this.modelName = modelName || model.modelName;
  }

  // Format doc to ensure clean plain object with string id
  _format(doc) {
    if (!doc) return null;
    const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
    if (!obj.id && obj._id) {
      obj.id = obj._id.toString();
    }
    delete obj.__v;
    return obj;
  }

  // Find multiple documents
  async find(query = {}) {
    const docs = await this.model.find(query).lean();
    return docs.map(d => this._format(d));
  }

  // Find single document by id (UUID or ObjectId)
  async findById(id) {
    if (!id) return null;
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const filter = isObjectId ? { $or: [{ id: String(id) }, { _id: id }] } : { id: String(id) };
    const doc = await this.model.findOne(filter).lean();
    return this._format(doc);
  }

  // Find single document by arbitrary query
  async findOne(query = {}) {
    const doc = await this.model.findOne(query).lean();
    return this._format(doc);
  }

  // Internal audit log
  async _logAudit(operation, entityId, changes, userId) {
    try {
      // Avoid circular recursion if auditing AuditLog itself
      if (this.modelName === 'AuditLog') return;
      const AuditLog = mongoose.models.AuditLog;
      if (AuditLog) {
        await AuditLog.create({
          id: crypto.randomUUID(),
          entity: this.modelName,
          entity_id: String(entityId),
          operation,
          changes: typeof changes === 'object' ? JSON.stringify(changes) : String(changes || ''),
          performed_by: userId || 'system',
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      logger.warn(`Failed to write audit log: ${err.message}`);
    }
  }

  // Insert a new document
  async insert(data, userId) {
    const id = data.id || crypto.randomUUID();
    const now = new Date().toISOString();

    const recordData = {
      ...data,
      id,
      created_at: data.created_at || now,
      updated_at: data.updated_at || now,
      created_by: data.created_by || userId || 'system',
      updated_by: data.updated_by || userId || 'system',
    };

    const doc = await this.model.create(recordData);
    const formatted = this._format(doc);

    await this._logAudit('CREATE', id, formatted, userId);

    return formatted;
  }

  // Update an existing document by id
  async update(id, data, userId) {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`${this.modelName} with id ${id} not found`);
    }

    const now = new Date().toISOString();
    const updatePayload = {
      ...data,
      updated_at: now,
    };
    if (userId) {
      updatePayload.updated_by = userId;
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const filter = isObjectId ? { $or: [{ id: String(id) }, { _id: id }] } : { id: String(id) };

    const updated = await this.model.findOneAndUpdate(
      filter,
      { $set: updatePayload },
      { returnDocument: 'after', runValidators: true }
    ).lean();

    const formatted = this._format(updated);
    await this._logAudit('UPDATE', id, updatePayload, userId);

    return formatted;
  }

  // Delete an existing document by id
  async delete(id, userId) {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error(`${this.modelName} with id ${id} not found`);
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const filter = isObjectId ? { $or: [{ id: String(id) }, { _id: id }] } : { id: String(id) };

    await this.model.findOneAndDelete(filter);
    await this._logAudit('DELETE', id, existing, userId);

    return true;
  }

  // Transaction support with graceful standalone fallback
  async transaction(operationsFn) {
    let session = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction();
      const result = await operationsFn(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      if (session && session.inTransaction()) {
        await session.abortTransaction().catch(() => {});
      }
      // If MongoDB is running in standalone mode (no replica set), sessions/transactions are not supported
      if (error.message && error.message.includes('Transactions are not supported')) {
        return operationsFn();
      }
      throw error;
    } finally {
      if (session) {
        session.endSession().catch(() => {});
      }
    }
  }
}

module.exports = BaseRepository;
