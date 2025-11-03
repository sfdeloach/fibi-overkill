FROM redis:8.2.2-bookworm

# Copy a custom redis.conf file
COPY redis.conf /usr/local/etc/redis/redis.conf

# Start Redis with the custom configuration
CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]

# Expose the default Redis port
EXPOSE 6379