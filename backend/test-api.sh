#!/bin/bash

echo "Testing Meeting Booking API..."
echo ""

BASE_URL="http://localhost:5050/api"

echo "1. Testing registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "username": "admin",
    "email": "admin@test.com", 
    "password": "password123"
  }')

echo "Registration response: $REGISTER_RESPONSE"
echo ""

echo "2. Creating room (admin only)..."
ROOM_RESPONSE=$(curl -s -X POST "$BASE_URL/rooms" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Conference Room A",
    "capacity": 10,
    "description": "Large conference room"
  }')

echo "Room creation response: $ROOM_RESPONSE"
echo ""

echo "3. Getting all rooms..."
ROOMS_RESPONSE=$(curl -s -X GET "$BASE_URL/rooms" \
  -H "Content-Type: application/json" \
  -b cookies.txt)

echo "Rooms response: $ROOMS_RESPONSE"
echo ""

echo "4. Getting available rooms..."
AVAILABLE_RESPONSE=$(curl -s -X GET "$BASE_URL/rooms/available?start_time=2025-11-05T10:00:00Z&end_time=2025-11-05T11:00:00Z" \
  -H "Content-Type: application/json" \
  -b cookies.txt)

echo "Available rooms response: $AVAILABLE_RESPONSE"
echo ""

echo "5. Creating booking..."
BOOKING_RESPONSE=$(curl -s -X POST "$BASE_URL/bookings" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "room_id": 1,
    "start_time": "2025-11-05T10:00:00Z",
    "end_time": "2025-11-05T11:00:00Z",
    "description": "Team meeting"
  }')

echo "Booking response: $BOOKING_RESPONSE"
echo ""

echo "6. Getting all bookings (admin only)..."
BOOKINGS_RESPONSE=$(curl -s -X GET "$BASE_URL/bookings" \
  -H "Content-Type: application/json" \
  -b cookies.txt)

echo "All bookings response: $BOOKINGS_RESPONSE"
echo ""

echo "7. Getting user bookings..."
USER_BOOKINGS_RESPONSE=$(curl -s -X GET "$BASE_URL/users/1/bookings" \
  -H "Content-Type: application/json" \
  -b cookies.txt)

echo "User bookings response: $USER_BOOKINGS_RESPONSE"
echo ""

echo "8. Cancelling booking..."
CANCEL_RESPONSE=$(curl -s -X DELETE "$BASE_URL/bookings/1" \
  -H "Content-Type: application/json" \
  -b cookies.txt)

echo "Cancel response: $CANCEL_RESPONSE"
echo ""

# Cleanup
rm -f cookies.txt

echo "🏁 Tests completed!"