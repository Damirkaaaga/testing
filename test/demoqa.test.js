import axios from "axios";
import * as chai from "chai";

const expect = chai.expect;
const BASE_URL = "https://demoqa.com/Account/v1";
const password = "MyStrongPass123!"; 

describe("DEMOQA API Tests (fully self-contained)", function () {
  this.timeout(10000);
  it("POST /User — create user (positive)", async function () {
    const username = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const res = await axios.post(`${BASE_URL}/User`, {
      userName: username,
      password: password,
    });
    expect(res.status).to.equal(201);
    expect(res.data.userID).to.be.a("string");
  });

  it("POST /User — empty password (negative)", async function () {
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
    const username = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    await axios.post(`${BASE_URL}/User`, { userName: username, password });
    const res = await axios.post(`${BASE_URL}/GenerateToken`, {
      userName: username,
      password,
    });
    expect(res.status).to.equal(200);
    expect(res.data.token).to.be.a("string");
  });

  it("POST /GenerateToken — wrong password", async function () {
    const username = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    await axios.post(`${BASE_URL}/User`, { userName: username, password });
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
    const username = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const createRes = await axios.post(`${BASE_URL}/User`, {
      userName: username,
      password,
    });
    const userId = createRes.data.userID;

    const tokenRes = await axios.post(`${BASE_URL}/GenerateToken`, {
      userName: username,
      password,
    });
    const token = tokenRes.data.token;

    const res = await axios.get(`${BASE_URL}/User/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(res.status).to.equal(200);
    expect(res.data.username).to.equal(username);
  });

  it("GET /User/{UUID} — non-existent user", async function () {
    const username = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    await axios.post(`${BASE_URL}/User`, { userName: username, password });
    const tokenRes = await axios.post(`${BASE_URL}/GenerateToken`, {
      userName: username,
      password,
    });
    const token = tokenRes.data.token;

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

  it("DELETE /User/{UUID} — delete user", async function () {
    const username = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const createRes = await axios.post(`${BASE_URL}/User`, {
      userName: username,
      password,
    });
    const userId = createRes.data.userID;

    const tokenRes = await axios.post(`${BASE_URL}/GenerateToken`, {
      userName: username,
      password,
    });
    const token = tokenRes.data.token;

    const res = await axios.delete(`${BASE_URL}/User/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(res.status).to.equal(204);
  });

  it("DELETE /User/{UUID} — delete non-existent user", async function () {
    const username = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    await axios.post(`${BASE_URL}/User`, { userName: username, password });
    const tokenRes = await axios.post(`${BASE_URL}/GenerateToken`, {
      userName: username,
      password,
    });
    const token = tokenRes.data.token;

    try {
      await axios.delete(`${BASE_URL}/User/0000-0000-0000-0000`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      expect(err.response.status).to.be.oneOf([400, 401, 403, 404]);
    }
  });
});
