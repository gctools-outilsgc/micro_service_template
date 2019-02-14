#!/bin/sh

# Wait for prisma to be ready
echo "Waiting for prisma..."
sleep 10


# Deploy to prisma endpoint any changes
echo "deploying to prisma"
cd prisma && yarn prisma deploy && cd ..

# Start server
echo "Starting server"
npm start