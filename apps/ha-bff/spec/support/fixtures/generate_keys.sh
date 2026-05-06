# Generate test RSA keys for JWT signing in specs
# Run: bash spec/support/fixtures/generate_keys.sh

# Generate private key
openssl genrsa -out keycloak_rsa.pem 2048

# Extract public key
openssl rsa -in keycloak_rsa.pem -pubout -out keycloak_rsa.pub

echo "Keys generated: keycloak_rsa.pem (private), keycloak_rsa.pub (public)"
