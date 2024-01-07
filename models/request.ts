import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  binPath: String,
  event: {
    client_ip: String,
    method: { 
      type: String, 
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'CONNECT', 'OPTIONS', 'TRACE']
    },
    url: String,
    path: String,
    headers: Object,
    body: Object,
    query: Object,
    protocol_version: String
    // tls_info: Object
  },
  // payload: {
  //   raw: String,
  // },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

requestSchema.set('toJSON', {
  transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString();
      delete returnedObject._id;
      delete returnedObject.__v;
  }
});

const Request = mongoose.model('Request', requestSchema);
export default Request;
