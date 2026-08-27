# Build multi-etapa: compila el frontend (Vite) y el backend (Express)
# y produce una sola imagen que sirve ambos desde el mismo origen.

FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json* ./
RUN npm install
COPY backend/ ./
RUN npx prisma generate && npm run build
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
