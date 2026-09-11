import FacultyDashboard from "./faculty/FacultyDashboard";
import AdminDashboard from "./admin/AdminDashboard";
import MentorDashboard from "./mentor/MentorDashboard";
import StudentDashboard from "./student/StudentDashboard";


function RoleDashboard() {

    const storedUser = localStorage.getItem("user");


    // No logged-in user
    if (!storedUser) {
        return null;
    }


    let user;


    // Read saved user data
    try {

        user = JSON.parse(storedUser);

    } catch (error) {

        console.error(
            "Invalid user data:",
            error
        );

        localStorage.clear();

        window.location.reload();

        return null;
    }


    /*
     * login_role stores the role selected
     * on the login screen.
     *
     * Mentor is actually stored in the database
     * as a FACULTY user.
     *
     * Therefore:
     *
     * FACULTY account
     *      |
     *      |--- Faculty Login ---> Faculty Dashboard
     *      |
     *      |--- Mentor Login ----> Mentor Dashboard
     *
     * Student and Admin use their normal roles.
     */

    const loginRole =
        localStorage.getItem("login_role");


    // =========================================
    // MENTOR LOGIN
    // =========================================

    if (
        loginRole === "MENTOR" &&
        user.role === "FACULTY"
    ) {

        return <MentorDashboard />;

    }


    // =========================================
    // NORMAL ROLE
    // =========================================

    switch (user.role) {


        // -------------------------------------
        // ADMIN
        // -------------------------------------

        case "ADMIN":

            return <AdminDashboard />;


        // -------------------------------------
        // FACULTY
        // -------------------------------------

        case "FACULTY":

            return <FacultyDashboard />;


        // -------------------------------------
        // STUDENT
        // -------------------------------------

        case "STUDENT":

            return <StudentDashboard />;


        // -------------------------------------
        // UNKNOWN ROLE
        // -------------------------------------

        default:

            return (

                <div
                    style={{
                        padding: "40px",
                        fontFamily: "Arial, sans-serif"
                    }}
                >

                    <h1>
                        Unknown Role
                    </h1>

                    <p>
                        Your account role is not
                        configured correctly.
                    </p>

                </div>

            );

    }

}


export default RoleDashboard;