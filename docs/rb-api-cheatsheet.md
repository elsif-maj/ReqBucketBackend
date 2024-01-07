# RequestBin API Routes Cheatsheet

## Bins

### Get All Bins

- **Endpoint**: `GET /api/bins/`
- **Description**: Retrieve all available bins.

### Create a New Bin

- **Endpoint**: `POST /api/bins/`
- **Description**: Create a new bin and returns it.

### Get a Specific Bin by Path

- **Endpoint**: `GET /api/bins/:binPath`
- **Description**: Retrieve information about a bin identified by its binPath.

### Delete a Specific Bin by Path

- **Endpoint**: `DELETE /api/bins/:binPath`
- **Description**: Delete a bin identified by its binPath.

## Requests

### Capture Incoming HTTP/Webhook Requests

- **Endpoint**: `ALL /api/bins/:binPath/incoming`
- **Description**: Capture all incoming HTTP/Webhook requests to a specific bin identified by its binPath.

### Get All Requests for a Specific Bin

- **Endpoint**: `GET /api/bins/:binPath/requests`
- **Description**: Retrieve all requests associated with a bin identified by its binPath.

### Get a Specific Request by ID for a Specific Bin

- **Endpoint**: `GET /api/bins/:binPath/requests/:reqId`
- **Description**: Retrieve a specific request identified by reqId for a bin identified by its binPath.

### Delete a Specific Request by ID for a Specific Bin

- **Endpoint**: `DELETE /api/bins/:binPath/requests/:reqId`
- **Description**: Delete a specific request identified by reqId for a bin identified by its binPath.