import axios from "axios";
import * as chai from "chai";
import nock from "nock";

const expect = chai.expect;
const BASE_URL = "https://api.example.com";

describe("Mocked API response tests", () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it("should return valid user data for ID = 1 (status 200)", async () => {
    const userMock = {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      username: "johndoe",
      phone: "+1-555-123-4567",
      address: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zipcode: "10001",
        country: "USA",
      },
      company: {
        name: "Doe Enterprises",
        industry: "Technology",
        position: "Software Engineer",
      },
      dob: "1990-05-15",
      profile_picture_url: "https://example.com/images/johndoe.jpg",
      is_active: true,
      created_at: "2023-01-01T12:00:00Z",
      updated_at: "2023-10-01T12:00:00Z",
      preferences: {
        language: "en",
        timezone: "America/New_York",
        notifications_enabled: true,
      },
    };

    nock(BASE_URL).get("/users/1").reply(200, userMock);

    const response = await axios.get(`${BASE_URL}/users/1`);
    expect(response.status).to.equal(200);
    expect(response.data).to.include.all.keys(
      "id",
      "name",
      "email",
      "address",
      "preferences"
    );
    expect(response.data.address).to.have.all.keys(
      "street",
      "city",
      "state",
      "zipcode",
      "country"
    );
    expect(response.data.preferences)
      .to.have.property("notifications_enabled")
      .that.is.a("boolean");
  });

  it("should return 204 No Content", async () => {
    nock(BASE_URL).get("/users/204").reply(204);

    const response = await axios.get(`${BASE_URL}/users/204`);
    expect(response.status).to.equal(204);
    expect(response.data).to.be.empty;
  });

  it("should return 403 Forbidden", async () => {
    nock(BASE_URL)
      .get("/users/403")
      .reply(403, { error: "Forbidden", details: "Access denied" });

    try {
      await axios.get(`${BASE_URL}/users/403`);
    } catch (err) {
      expect(err.response.status).to.equal(403);
      expect(err.response.data).to.include.keys("error", "details");
    }
  });

  it("should return 404 Not Found", async () => {
    nock(BASE_URL)
      .get("/users/404")
      .reply(404, { error: "Not Found", details: "User not found" });

    try {
      await axios.get(`${BASE_URL}/users/404`);
    } catch (err) {
      expect(err.response.status).to.equal(404);
      expect(err.response.data)
        .to.have.property("error")
        .that.equals("Not Found");
    }
  });

  it(" should return 502 Bad Gateway", async () => {
    nock(BASE_URL)
      .get("/users/502")
      .reply(502, { error: "Bad Gateway", details: "Upstream error" });

    try {
      await axios.get(`${BASE_URL}/users/502`);
    } catch (err) {
      expect(err.response.status).to.equal(502);
      expect(err.response.data.details).to.equal("Upstream error");
    }
  });
});
