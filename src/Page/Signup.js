import { auth, db } from "../FirebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import "./Style/Signup.css";

export default function Signup() {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    const name = e.target.name.value;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      console.log(user);
      if (user) {
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          name: name,
        });
      }
      alert("user Registered Successfully!");
      window.location.href = "/login";
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <>
      <div className="signup-container">
        <div className="signup-logo">
          <img
            src="https://cdn-icons-png.flaticon.com/512/10233/10233512.png"
            alt="Your Company"
          />
          <h2>Signup Now</h2>
        </div>

        <div className="signup-form">
          <form onSubmit={(e) => handleSubmit(e)} action="#">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <div className="mt-2">
                <input
                  id="name"
                  name="name"
                  type="name"
                  autoComplete="name"
                  required
                  className="signup-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="signup-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="signup-input"
                />
              </div>
            </div>

            <div>
              <button type="submit" className="signup-button">
                Signup
              </button>
            </div>
          </form>

          <p>
            Have an account?{" "}
            <a href="/login" className="signup-login-link">
              Login now
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
