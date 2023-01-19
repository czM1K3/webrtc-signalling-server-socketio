FROM lukechannings/deno:v1.29.3 as builder
WORKDIR /app
COPY . .
RUN deno compile --allow-net --allow-env --output ./server ./src/index.ts

FROM debian:stable-slim as runner
RUN printf '* soft nofile 1048576\n* hard nofile 1048576\n' > /etc/security/limits.d/custom.conf
WORKDIR /app
RUN adduser --uid 1002 deno
COPY --from=builder /app/server ./server
USER deno
EXPOSE 3000

CMD ["./server"]