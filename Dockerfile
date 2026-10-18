# Multi-stage production container build for Render.com (https://hendy-video-studio-new-pro.onrender.com/), Railway, Fly.io, Google Cloud Run
FROM node:20-alpine AS builder

WORKDIR /app

# Install all dependencies (including build toolchain)
COPY package*.json ./
RUN npm install --include=dev

# Copy source and build production SPA bundle
COPY . .
RUN npm run build

# Runtime Stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV PUBLIC_URL=https://hendy-video-studio-new-pro.onrender.com

# Install FFmpeg for server-side video/audio processing
RUN apk add --no-cache ffmpeg

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/vite.config.ts ./vite.config.ts

EXPOSE 3000

CMD ["npm", "start"]
