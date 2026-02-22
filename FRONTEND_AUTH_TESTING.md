# 🧪 Frontend Auth Testing Guide

## ✅ What's Been Implemented

### **Frontend Components:**
- ✅ `AuthContext` - Global authentication state management
- ✅ `AuthModal` - Login/Register modal with smooth animations
- ✅ Login/Logout button (bottom right corner)
- ✅ Auth state persistence (localStorage)
- ✅ All API endpoints for auth and analyses

### **Features:**
- Login/Register modal (not a separate page)
- Auto-saves JWT token in localStorage
- Shows username when logged in
- Logout button when authenticated
- Smooth animations and error handling

---

## 🚀 How to Test

### 1. **Start the Backend with Database**

```powershell
# Make sure PostgreSQL is running in Docker
docker-compose up -d

# Start the FastAPI backend
cd backend
uvicorn main:app --reload
```

### 2. **Start the Frontend**

```powershell
cd frontend
npm run dev
```

### 3. **Test Authentication Flow**

1. **Click "Login" button** (bottom right corner)
2. **Register a new account:**
   - Click "Register" link in modal
   - Fill in: Email, Username, Password
   - Click "Create Agent Profile"
3. **You'll be auto-logged in** after registration
4. **See your username** displayed above logout button
5. **Click "Logout"** to test logout
6. **Click "Login"** again and sign in with credentials

---

## 🎨 UI Features

### **Login Button (Not Logged In):**
- Bottom right corner
- Cyan/teal (#00ffcc) border
- Says "LOGIN"
- Glows on hover

### **When Logged In:**
- Shows username in small badge
- Logout button (red theme)
- Stacks vertically in bottom right

### **Auth Modal:**
- Dark cyberpunk design matching app theme
- Smooth fade-in animation
- Toggle between Login/Register
- Error messages for failed auth
- Form validation (email format, password min length)
- Click outside or X to close

---

## 🐛 Common Issues & Solutions

### **Database Connection Error**
```
Could not connect to database
```
**Solution:** Make sure PostgreSQL is running:
```powershell
docker ps  # Should see lore-graph-db
docker-compose up -d  # If not running
```

### **401 Unauthorized**
```
Could not validate credentials
```
**Solution:** 
- Token expired or invalid
- Click logout and login again

### **Registration Fails (400)**
```
Username already registered
```
**Solution:** Use a different username/email

### **Backend Not Running**
```
Network Error / ERR_CONNECTION_REFUSED
```
**Solution:**
```powershell
cd backend
uvicorn main:app --reload
```

---

## 🔍 Testing Checklist

- [ ] Can open login modal by clicking login button
- [ ] Can register new user with email/username/password
- [ ] Auto-logged in after registration
- [ ] Username displays in bottom right
- [ ] Can logout successfully
- [ ] Can login with existing credentials
- [ ] Modal closes on successful auth
- [ ] Errors display when auth fails
- [ ] Token persists after page refresh
- [ ] Can click outside modal to close

---

## 📝 Next Steps

After auth is working, we can add:
1. **Save Analysis** button (saves current graph to database)
2. **Load Analysis** panel (list of saved analyses)
3. **Analysis library** with preview cards
4. Permission checks (only show save/load when authenticated)

---

## 🎯 Quick Test Commands

### **Check if database is accessible:**
```powershell
docker exec -it lore-graph-db psql -U loreuser -d loredb -c "\dt"
```

### **View registered users:**
```powershell
docker exec -it lore-graph-db psql -U loreuser -d loredb -c "SELECT id, username, email FROM users;"
```

### **Clear all users (for testing):**
```powershell
docker exec -it lore-graph-db psql -U loreuser -d loredb -c "TRUNCATE users CASCADE;"
```

---

**Everything should work now! Test the login flow and let me know if you see any issues.** 🚀
