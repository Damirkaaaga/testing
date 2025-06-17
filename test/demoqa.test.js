import axios from "axios";
import * as chai from "chai";
import dotenv from "dotenv";

dotenv.config();
const expect = chai.expect;

const BASE_URL = "https://demoqa.com/Account/v1";
let userId = null;
let token = null;

describe("DEMOQA API Tests", function () {
  const username = process.env.USERNAME;
  const password = process.env.PASSWORD;

  it(" POST /User — create user (positive)", async function () {
    const res = await axios.post(`${BASE_URL}/User`, {
      userName: username,
      password: password,
    });
    expect(res.status).to.equal(201);
    expect(res.data.userID).to.be.a("string");
    userId = res.data.userID;
  });

  it(" POST /User — empty password (negative)", async function () {
    try {
      await axios.post(`${BASE_URL}/User`, {
        userName: "badUser",
        password: "",
      });
    } catch (err) {
      expect(err.response.status).to.equal(400);
      expect(err.response.data.message).to.equal(
        "UserName and Password required."
      );
    }
  });

  it("POST /GenerateToken — with correct credentials", async function () {
    const res = await axios.post(`${BASE_URL}/GenerateToken`, {
      userName: username,
      password: password,
    });
    expect(res.status).to.equal(200);
    expect(res.data.token).to.be.a("string");
    token = res.data.token;
  });

  it(" POST /GenerateToken — wrong password", async function () {
    try {
      await axios.post(`${BASE_URL}/GenerateToken`, {
        userName: username,
        password: "WrongPass123!",
      });
    } catch (err) {
      expect(err.response.status).to.equal(400);
      expect(err.response.data.message).to.include("not authorized");
    }
  });

  it("GET /User/{UUID} — get existing user", async function () {
    const res = await axios.get(`${BASE_URL}/User/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(res.status).to.equal(200);
    expect(res.data.username).to.equal(username);
  });

  it(" GET /User/{UUID} — non-existent user", async function () {
    try {
      await axios.get(`${BASE_URL}/User/0000-0000-0000-0000`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      expect(err.response.status).to.equal(401);
    }
  });

  it(" DELETE /User/{UUID} — delete user", async function () {
    const res = await axios.delete(`${BASE_URL}/User/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(res.status).to.equal(204);
  });

  it(" DELETE /User/{UUID} — delete non-existent user", async function () {
    try {
      await axios.delete(`${BASE_URL}/User/0000-0000-0000-0000`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      expect(err.response.status).to.be.oneOf([401, 403, 404]);
    }
  });
});
