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

In Sprint 5, automated unit tests were implemented for the backend. The tests cover all main API endpoints across 5 test files.

**Test files:**

| File | Module | Tests |
|---|---|---|
| `backend/tests/auth.test.js` | Authentication | 33 |
| `backend/tests/fairs.test.js` | Fairs CRUD | 40 |
| `backend/tests/casetas.test.js` | Stalls CRUD | 43 |
| `backend/tests/menus.test.js` | Menus CRUD | 47 |
| `backend/tests/concerts.test.js` | Concerts CRUD | 45 |
| **Total** | | **208** |

**Test scenarios covered per module:**
- Successful creation with valid data
- Authentication failures (no token, invalid token)
- Validation failures (missing required fields, empty fields, invalid formats)
- Non-existent resource errors (invalid IDs, deleted resources)
- Edge cases (special characters, long strings, null values)
- Bulk operations (menus bulk creation)

---

## Running the tests.

```bash
cd backend
npm test
```

**Result:**

```
PASS  tests/concerts.test.js
PASS  tests/auth.test.js
PASS  tests/menus.test.js
PASS  tests/casetas.test.js
PASS  tests/fairs.test.js

Test Suites: 5 passed, 5 total
Tests:       208 passed, 208 total
Time:        6.94 s
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