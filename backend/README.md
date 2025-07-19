1. Immediate:


    - Remove 10ms delays between chunks
    - Increase chunk size to 512KB
    - Enable WebSocket compression

2. Medium term:


    - Switch to binary messages (remove base64)
    - Implement parallel chunk sending

    - Add buffer pooling on backend

3. Advanced:


    - Multiple WebSocket connections
    - Smart chunking strategies
    - TCP buffer tuning

Expected Speed Improvements:

- Remove delays + larger chunks: 5-10x faster
- Binary messages: 1.3x faster (no base64 overhead)
- Parallel sending: 2-4x faster
- Compression: 2-5x faster (depending on file type)
