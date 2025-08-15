# Authentication Testing Guide

This guide outlines all authentication flows that need to be tested after implementing NextAuth.

## Prerequisites

1. Ensure `NEXTAUTH_SECRET` environment variable is set
2. Database is seeded with test accounts
3. Application is running in development mode

## Test Accounts

### Bank Sampah Admin
- Email: `admin@banksampah.com`
- Password: `password123`
- Expected redirect: `/bank-sampah`

### Nasabah (Customer)
- Email: `budi@email.com`
- Password: `password123`
- Expected redirect: `/nasabah`

### Controller (Super Admin)
- Email: `admin@controller.com`
- Password: `password`
- Expected redirect: `/controller`

## Authentication Flow Tests

### 1. Login Flow Tests

#### Test 1.1: Successful Bank Sampah Login
- [ ] Navigate to `/`
- [ ] Enter bank sampah credentials
- [ ] Click "Masuk" button
- [ ] Verify redirect to `/bank-sampah`
- [ ] Verify dashboard loads with correct data
- [ ] Verify user name appears in navigation

#### Test 1.2: Successful Nasabah Login
- [ ] Navigate to `/`
- [ ] Enter nasabah credentials
- [ ] Click "Masuk" button
- [ ] Verify redirect to `/nasabah`
- [ ] Verify dashboard loads with correct data
- [ ] Verify bank sampah selector works

#### Test 1.3: Successful Controller Login
- [ ] Navigate to `/`
- [ ] Enter controller credentials
- [ ] Click "Masuk" button
- [ ] Verify redirect to `/controller`
- [ ] Verify dashboard loads with bank sampah list
- [ ] Verify all controller features accessible

#### Test 1.4: Invalid Credentials
- [ ] Navigate to `/`
- [ ] Enter invalid email/password
- [ ] Click "Masuk" button
- [ ] Verify error message appears
- [ ] Verify no redirect occurs
- [ ] Verify form remains accessible

### 2. Route Protection Tests

#### Test 2.1: Unauthenticated Access
- [ ] Navigate to `/bank-sampah` without login
- [ ] Verify redirect to `/`
- [ ] Navigate to `/nasabah` without login
- [ ] Verify redirect to `/`
- [ ] Navigate to `/controller` without login
- [ ] Verify redirect to `/`

#### Test 2.2: Wrong User Type Access
- [ ] Login as bank sampah user
- [ ] Try to access `/nasabah`
- [ ] Verify redirect to `/`
- [ ] Try to access `/controller`
- [ ] Verify redirect to `/`

#### Test 2.3: Authenticated User on Login Page
- [ ] Login as any user type
- [ ] Navigate to `/`
- [ ] Verify redirect to appropriate dashboard

### 3. Session Management Tests

#### Test 3.1: Session Persistence
- [ ] Login successfully
- [ ] Refresh the page
- [ ] Verify user remains logged in
- [ ] Navigate between pages
- [ ] Verify session persists

#### Test 3.2: Session Expiration
- [ ] Login successfully
- [ ] Wait for session to expire (24 hours or manually expire)
- [ ] Try to access protected route
- [ ] Verify redirect to login page

### 4. Logout Flow Tests

#### Test 4.1: Successful Logout
- [ ] Login as any user type
- [ ] Click logout button/link
- [ ] Verify redirect to `/`
- [ ] Try to access previous protected route
- [ ] Verify redirect to login page

### 5. Profile Update Tests

#### Test 5.1: Controller Profile Update
- [ ] Login as controller
- [ ] Navigate to `/controller/profile`
- [ ] Update name or email
- [ ] Submit form
- [ ] Verify success message
- [ ] Verify updated name appears in navigation immediately

### 6. Password Visibility Tests

#### Test 6.1: Login Form Password Toggle
- [ ] Navigate to `/`
- [ ] Enter password
- [ ] Click eye icon
- [ ] Verify password becomes visible
- [ ] Click eye icon again
- [ ] Verify password becomes hidden

#### Test 6.2: Registration Form Password Toggle
- [ ] Navigate to controller bank sampah registration
- [ ] Enter passwords
- [ ] Test eye icons on both password fields
- [ ] Verify both fields toggle independently

### 7. Loading States Tests

#### Test 7.1: Login Loading State
- [ ] Navigate to `/`
- [ ] Enter credentials
- [ ] Click "Masuk" button
- [ ] Verify button shows "Memproses..." with spinner
- [ ] Verify button is disabled during loading

### 8. Error Handling Tests

#### Test 8.1: Network Error Handling
- [ ] Disconnect internet
- [ ] Try to login
- [ ] Verify appropriate error message
- [ ] Reconnect internet
- [ ] Verify login works again

#### Test 8.2: Server Error Handling
- [ ] Stop database/server
- [ ] Try to login
- [ ] Verify graceful error handling
- [ ] Restart services
- [ ] Verify recovery

## API Route Tests

### Test 9.1: NextAuth API Routes
- [ ] Verify `/api/auth/signin` returns login page
- [ ] Verify `/api/auth/signout` handles logout
- [ ] Verify `/api/auth/session` returns current session
- [ ] Verify `/api/auth/csrf` returns CSRF token

## Security Tests

### Test 10.1: JWT Token Security
- [ ] Login successfully
- [ ] Check browser dev tools for JWT token
- [ ] Verify token is httpOnly (not accessible via JavaScript)
- [ ] Verify token has appropriate expiration

### Test 10.2: CSRF Protection
- [ ] Verify CSRF tokens are present in forms
- [ ] Verify requests without CSRF tokens are rejected

## Performance Tests

### Test 11.1: Login Performance
- [ ] Measure login response time
- [ ] Verify login completes within 2 seconds
- [ ] Test with multiple concurrent logins

## Browser Compatibility Tests

### Test 12.1: Cross-Browser Testing
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge
- [ ] Verify consistent behavior across browsers

## Mobile Responsiveness Tests

### Test 13.1: Mobile Login
- [ ] Test login form on mobile devices
- [ ] Verify password visibility toggle works on mobile
- [ ] Verify navigation works on mobile after login

## Troubleshooting Common Issues

### Issue: "NEXTAUTH_SECRET is not set"
- Solution: Add `NEXTAUTH_SECRET=your-secret-key` to `.env.local`

### Issue: "Session not found" errors
- Solution: Clear browser cookies and try again

### Issue: Infinite redirect loops
- Solution: Check middleware configuration and user type validation

### Issue: Login form not submitting
- Solution: Verify NextAuth API routes are accessible

## Success Criteria

All tests above should pass for the authentication system to be considered fully functional and secure.
