#!/bin/bash

# GamePlan - Curl Example for Account Creation
# This script demonstrates how to create a new user account via the API

# API Configuration
API_BASE_URL="http://localhost:3000/api/v1"
REGISTER_ENDPOINT="/auth/register"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  GamePlan Account Creation Example     ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Example 1: Basic account creation
echo -e "${YELLOW}Example 1: Basic Account Creation${NC}"
echo "curl -X POST ${API_BASE_URL}${REGISTER_ENDPOINT}"
echo ""

curl -X POST "${API_BASE_URL}${REGISTER_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "firstName": "João",
    "lastName": "Silva",
    "email": "joao.silva@example.com",
    "password": "MinhaSenh@123",
    "birthDate": "1995-03-15",
    "country": "PT",
    "phone": "+351912345678",
    "terms": true
  }' \
  -w "\n\nHTTP Status: %{http_code}\nTotal time: %{time_total}s\n" \
  -s

echo -e "\n${GREEN}✓ Request completed${NC}"
echo -e "${BLUE}----------------------------------------${NC}\n"

# Example 2: Account creation without optional phone
echo -e "${YELLOW}Example 2: Account Without Phone (Optional Field)${NC}"
echo "curl -X POST ${API_BASE_URL}${REGISTER_ENDPOINT}"
echo ""

curl -X POST "${API_BASE_URL}${REGISTER_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "firstName": "Maria",
    "lastName": "Santos",
    "email": "maria.santos@example.com",
    "password": "OutraSenh@456",
    "birthDate": "1990-07-22",
    "country": "PT",
    "terms": true
  }' \
  -w "\n\nHTTP Status: %{http_code}\nTotal time: %{time_total}s\n" \
  -s

echo -e "\n${GREEN}✓ Request completed${NC}"
echo -e "${BLUE}----------------------------------------${NC}\n"

# Example 3: Test with international user
echo -e "${YELLOW}Example 3: International User${NC}"
echo "curl -X POST ${API_BASE_URL}${REGISTER_ENDPOINT}"
echo ""

curl -X POST "${API_BASE_URL}${REGISTER_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "birthDate": "1988-12-01",
    "country": "US",
    "phone": "+14155552671",
    "terms": true
  }' \
  -w "\n\nHTTP Status: %{http_code}\nTotal time: %{time_total}s\n" \
  -s

echo -e "\n${GREEN}✓ Request completed${NC}"
echo -e "${BLUE}----------------------------------------${NC}\n"

# Example 4: Test validation errors (invalid email)
echo -e "${YELLOW}Example 4: Testing Validation Errors (Invalid Email)${NC}"
echo "curl -X POST ${API_BASE_URL}${REGISTER_ENDPOINT}"
echo ""

curl -X POST "${API_BASE_URL}${REGISTER_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "invalid-email-format",
    "password": "TestPass123!",
    "birthDate": "1992-05-10",
    "country": "PT",
    "terms": true
  }' \
  -w "\n\nHTTP Status: %{http_code}\nTotal time: %{time_total}s\n" \
  -s

echo -e "\n${GREEN}✓ Request completed${NC}"
echo -e "${BLUE}----------------------------------------${NC}\n"

# Example 5: Test weak password
echo -e "${YELLOW}Example 5: Testing Weak Password${NC}"
echo "curl -X POST ${API_BASE_URL}${REGISTER_ENDPOINT}"
echo ""

curl -X POST "${API_BASE_URL}${REGISTER_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test.weak@example.com",
    "password": "123",
    "birthDate": "1992-05-10",
    "country": "PT",
    "terms": true
  }' \
  -w "\n\nHTTP Status: %{http_code}\nTotal time: %{time_total}s\n" \
  -s

echo -e "\n${GREEN}✓ Request completed${NC}"
echo -e "${BLUE}----------------------------------------${NC}\n"

# Field Requirements Information
echo -e "${BLUE}📋 FIELD REQUIREMENTS:${NC}"
echo ""
echo -e "${GREEN}Required Fields:${NC}"
echo "  • firstName: String, min 2 characters"
echo "  • lastName: String, min 2 characters"
echo "  • email: Valid email format"
echo "  • password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char"
echo "  • birthDate: YYYY-MM-DD format, minimum age 13"
echo "  • country: Country code (e.g., 'PT', 'US', 'ES')"
echo "  • terms: Boolean, must be true"
echo ""
echo -e "${YELLOW}Optional Fields:${NC}"
echo "  • phone: International format (+351912345678) or empty"
echo ""

# Password Requirements
echo -e "${BLUE}🔒 PASSWORD REQUIREMENTS:${NC}"
echo "  ✓ At least 8 characters"
echo "  ✓ At least 1 uppercase letter (A-Z)"
echo "  ✓ At least 1 lowercase letter (a-z)"
echo "  ✓ At least 1 number (0-9)"
echo "  ✓ At least 1 special character (!@#$%^&*(),.?\":{}|<>)"
echo ""

# Valid Password Examples
echo -e "${GREEN}✅ Valid Password Examples:${NC}"
echo "  • MinhaSenh@123"
echo "  • SecurePass123!"
echo "  • GamePlan2024#"
echo "  • MyP@ssw0rd"
echo ""

# HTTP Status Codes
echo -e "${BLUE}📊 EXPECTED HTTP STATUS CODES:${NC}"
echo -e "${GREEN}  • 201 Created${NC} - Account created successfully"
echo -e "${YELLOW}  • 400 Bad Request${NC} - Validation errors"
echo -e "${RED}  • 409 Conflict${NC} - Email already exists"
echo -e "${RED}  • 500 Internal Server Error${NC} - Server error"
echo ""

# Usage Instructions
echo -e "${BLUE}🚀 USAGE INSTRUCTIONS:${NC}"
echo "1. Make sure the GamePlan API server is running on localhost:3000"
echo "2. Run this script: chmod +x curl-example.sh && ./curl-example.sh"
echo "3. Or copy individual curl commands to test specific scenarios"
echo "4. Check the HTTP status codes and response messages"
echo ""

# Success Response Example
echo -e "${BLUE}✅ SUCCESS RESPONSE EXAMPLE:${NC}"
echo '{'
echo '  "success": true,'
echo '  "message": "User registered successfully",'
echo '  "data": {'
echo '    "user": {'
echo '      "id": "uuid-here",'
echo '      "firstName": "João",'
echo '      "lastName": "Silva",'
echo '      "email": "joao.silva@example.com",'
echo '      "country": "PT",'
echo '      "phone": "+351912345678",'
echo '      "createdAt": "2024-01-01T12:00:00.000Z"'
echo '    },'
echo '    "token": "jwt-token-here",'
echo '    "sessionId": "session-id-here"'
echo '  }'
echo '}'
echo ""

# Error Response Example
echo -e "${BLUE}❌ ERROR RESPONSE EXAMPLE:${NC}"
echo '{'
echo '  "success": false,'
echo '  "message": "Validation failed",'
echo '  "error": {'
echo '    "code": "VALIDATION_ERROR",'
echo '    "details": ['
echo '      {'
echo '        "field": "password",'
echo '        "message": "Password must contain at least 1 uppercase letter"'
echo '      }'
echo '    ]'
echo '  }'
echo '}'
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Script completed successfully!        ${NC}"
echo -e "${GREEN}========================================${NC}"
