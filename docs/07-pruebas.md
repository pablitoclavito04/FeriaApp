# 07. Testing.

## Testing methodology.

The project combines two types of testing: manual testing during development and automated unit testing in Sprint 4.

---

## Types of tests performed.

### 1. Manual testing with Insomnia.

During Sprint 1, all API endpoints were tested manually with Insomnia. The following were verified:

- Authentication: correct and incorrect login, valid and invalid JWT token.
- Fair CRUD: creation, reading, updating and deletion.
- Stall CRUD: including image uploads with Multer.
- Menu CRUD: individual creation and bulk creation.
- Concert CRUD.
- Publish endpoint: JSON generation and upload to GitHub Pages.

Screenshots of the tests are available in `docs/insomnia/`.

### 2. Unit tests with Jest and Supertest.

In Sprint 4, automated unit tests were implemented for the backend. The tests cover the authentication endpoints.

**Test file:** `backend/tests/auth.test.js`

**Implemented tests:**

| Test | Description | Expected result |
|---|---|---|
| Login with wrong credentials | POST /api/auth/login with incorrect email and password | 401 |
| Login with missing fields | POST /api/auth/login without password | 400 or above |
| Access to protected route without token | GET /api/auth/profile without Authorization header | 401 |

---

## Running the tests.

```bash
cd backend
npm test
```

**Result:**

```
PASS  tests/auth.test.js
  Auth API
    ✓ POST /api/auth/login - should fail with wrong credentials (82 ms)
    ✓ POST /api/auth/login - should fail with missing fields (14 ms)
    ✓ GET /api/auth/profile - should fail without token (10 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Time:        1.321 s
```

---

## CI/CD Pipeline with GitHub Actions.

Tests run automatically on every push to `develop` or `main` via GitHub Actions. The pipeline includes:

1. **Backend test:** Runs `npm test` with a MongoDB instance in the CI environment.
2. **Frontend build:** Runs `npm run build` to verify the frontend compiles without errors.
3. **Docker build:** Builds all Docker images to verify the Dockerfiles are valid.

The pipeline ensures that no code with failing tests reaches the `main` branch.

---

## Code coverage.

Automated tests cover the authentication endpoints. The CRUD endpoints for fairs, stalls, menus and concerts were covered with manual tests during development.

| Module | Test type | Coverage |
|---|---|---|
| Auth API | Unit (Jest) | Login and profile endpoints |
| Fairs API | Manual (Insomnia) | Full CRUD |
| Stalls API | Manual (Insomnia) | Full CRUD + image upload |
| Menus API | Manual (Insomnia) | Full CRUD + bulk |
| Concerts API | Manual (Insomnia) | Full CRUD |
| Publish API | Manual (Insomnia) | Publishing to GitHub Pages |