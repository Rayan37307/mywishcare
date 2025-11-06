# Removal Guide: WordPress Authentication System

This guide explains how to completely remove the WordPress authentication system from your React application.

## Files to Delete

1. `src/services/authService.ts`
2. `src/types/user.ts`
3. `src/hooks/useAuth.ts`
4. `src/components/LoginForm.tsx`
5. `src/components/ProtectedRoute.tsx`
6. `src/components/UserProfile.tsx`
7. `src/components/Navigation.tsx` (if you don't want the navigation features)

## Code to Remove from Existing Files

### In `src/App.tsx`:
Remove these imports:
```javascript
import LoginForm from './components/LoginForm';
import UserProfile from './components/UserProfile';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
```

Remove the route definitions:
```javascript
<Route path="/login" element={<LoginForm />} />
<Route 
  path="/profile" 
  element={
    <ProtectedRoute>
      <UserProfile />
    </ProtectedRoute>
  } 
/>
```

Remove the Navigation component from the render method:
```javascript
<Navigation />
```

### Environment Variables
Remove these from your `.env` file:
```
VITE_WP_API_URL=https://wishcarebd.com/wp-json
```

## Data Cleanup
Clear any stored authentication data from the browser by removing:
- LocalStorage items: 'wp_user', 'wp_auth_token', 'wp_jwt_token'

## Dependencies (Optional)
If you didn't need react-icons for anything else, you can also remove it:
```bash
npm uninstall react-icons
```

After performing these steps, your application will be restored to its pre-authentication state.