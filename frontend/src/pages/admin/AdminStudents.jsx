import { useEffect, useState } from "react";

import {
    Search,
    Plus,
    Users,
    UserCheck,
    UserX,
    X,
    Save
} from "lucide-react";

import api from "../../services/api";


function AdminStudents() {

    const [students, setStudents] = useState([]);
    const [sections, setSections] = useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [sectionsLoading, setSectionsLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);


    // =====================================================
    // EMPTY FORM
    // =====================================================

    const emptyForm = {
        username: "",
        password: "",
        email: "",
        first_name: "",
        last_name: "",
        roll_number: "",
        admission_number: "",
        section: "",
        parent_name: "",
        parent_phone: "",
        parent_email: "",
        is_active_student: true
    };


    const [form, setForm] = useState(emptyForm);


    // =====================================================
    // TOKEN
    // =====================================================

    const getToken = () => {
        return localStorage.getItem("access_token");
    };


    // =====================================================
    // LOAD STUDENTS
    // =====================================================

    const loadStudents = async () => {

        try {

            setLoading(true);
            setError("");

            const token = getToken();

            if (!token) {
                setError("You are not logged in.");
                return;
            }

            const response = await api.get(
                "/students/admin/students/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setStudents(response.data);

        } catch (err) {

            console.error(
                "Student loading error:",
                err
            );

            if (err.response?.status === 401) {

                setError(
                    "Your session has expired. Please login again."
                );

            } else if (err.response?.data?.detail) {

                setError(
                    err.response.data.detail
                );

            } else {

                setError(
                    "Unable to load students."
                );
            }

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // LOAD SECTIONS
    // =====================================================

    const loadSections = async () => {

        try {

            setSectionsLoading(true);

            const token = getToken();

            if (!token) {
                return;
            }

            const response = await api.get(
                "/academics/admin/sections/",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log(
                "Available sections:",
                response.data
            );

            setSections(response.data);

        } catch (err) {

            console.error(
                "Section loading error:",
                err
            );

            if (err.response?.data?.detail) {

                setError(
                    err.response.data.detail
                );

            } else {

                setError(
                    "Unable to load sections. Please create a section first."
                );
            }

        } finally {

            setSectionsLoading(false);

        }
    };


    // =====================================================
    // LOAD DATA
    // =====================================================

    useEffect(() => {

        loadStudents();
        loadSections();

    }, []);


    // =====================================================
    // HANDLE FORM CHANGE
    // =====================================================

    const handleChange = (event) => {

        const {
            name,
            value,
            type,
            checked
        } = event.target;

        setForm((previous) => ({
            ...previous,

            [name]:
                type === "checkbox"
                    ? checked
                    : value
        }));
    };


    // =====================================================
    // OPEN FORM
    // =====================================================

    const openForm = () => {

        setError("");

        setForm(emptyForm);

        setShowForm(true);
    };


    // =====================================================
    // CLOSE FORM
    // =====================================================

    const closeForm = () => {

        if (saving) {
            return;
        }

        setShowForm(false);

        setForm(emptyForm);

        setError("");
    };


    // =====================================================
    // CREATE STUDENT
    // =====================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setSaving(true);
        setError("");

        try {

            const token = getToken();

            if (!token) {

                setError(
                    "You are not logged in."
                );

                return;
            }


            if (!form.section) {

                setError(
                    "Please select a section."
                );

                return;
            }


            const data = {

                username:
                    form.username.trim(),

                password:
                    form.password,

                email:
                    form.email.trim(),

                first_name:
                    form.first_name.trim(),

                last_name:
                    form.last_name.trim(),

                roll_number:
                    form.roll_number.trim(),

                admission_number:
                    form.admission_number.trim() ||
                    null,

                section:
                    Number(form.section),

                parent_name:
                    form.parent_name.trim(),

                parent_phone:
                    form.parent_phone.trim(),

                parent_email:
                    form.parent_email.trim() ||
                    null,

                is_active_student:
                    form.is_active_student
            };


            console.log(
                "Creating student:",
                data
            );


            await api.post(
                "/students/admin/students/",
                data,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            alert(
                "Student created successfully."
            );


            setForm(emptyForm);

            setShowForm(false);

            await loadStudents();


        } catch (err) {

            console.error(
                "Student creation error:",
                err
            );


            const data =
                err.response?.data;


            if (
                data &&
                typeof data === "object"
            ) {

                const messages =
                    Object.entries(data)
                        .map(
                            ([field, message]) => {

                                const text =
                                    Array.isArray(
                                        message
                                    )
                                        ? message.join(
                                              ", "
                                          )
                                        : String(
                                              message
                                          );

                                return `${field}: ${text}`;
                            }
                        );


                setError(
                    messages.join(" | ")
                );

            } else {

                setError(
                    "Unable to create student."
                );
            }

        } finally {

            setSaving(false);

        }
    };


    // =====================================================
    // ACTIVATE / DEACTIVATE
    // =====================================================

    const toggleStudentStatus = async (
        student
    ) => {

        try {

            const token = getToken();

            await api.patch(
                `/students/admin/students/${student.id}/`,
                {
                    is_active_student:
                        !student.is_active_student
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            await loadStudents();

        } catch (err) {

            console.error(
                "Status update error:",
                err
            );

            alert(
                "Unable to update student status."
            );
        }
    };


    // =====================================================
    // SEARCH
    // =====================================================

    const filteredStudents =
        students.filter((student) => {

            const searchText =
                `${student.first_name || ""} ${
                    student.last_name || ""
                } ${
                    student.username || ""
                } ${
                    student.roll_number || ""
                } ${
                    student.admission_number || ""
                } ${
                    student.program_code || ""
                } ${
                    student.section_name || ""
                }`.toLowerCase();

            return searchText.includes(
                search.toLowerCase()
            );
        });


    // =====================================================
    // STUDENT NAME
    // =====================================================

    const getStudentName = (student) => {

        const name =
            `${student.first_name || ""} ${
                student.last_name || ""
            }`.trim();

        return name || student.username;
    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="admin-students-page">


            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="students-page-header">

                <div>

                    <h1>
                        Manage Students
                    </h1>

                    <p>
                        Add, view and manage student accounts
                    </p>

                </div>


                <button
                    className="add-student-button"
                    onClick={openForm}
                >

                    <Plus size={19} />

                    Add Student

                </button>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="students-error">

                    {error}

                </div>

            )}


            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="students-toolbar">

                <div className="student-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search by name, username, roll number or class..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>


                <div className="student-count">

                    <Users size={18} />

                    <span>
                        {filteredStudents.length} Students
                    </span>

                </div>

            </div>


            {/* =================================================
                STUDENT TABLE
            ================================================= */}

            <div className="students-table-card">

                {loading ? (

                    <div className="students-loading">
                        Loading students...
                    </div>

                ) : filteredStudents.length === 0 ? (

                    <div className="students-empty">

                        <Users size={45} />

                        <h3>
                            No students found
                        </h3>

                        <p>
                            Add a student to get started.
                        </p>

                    </div>

                ) : (

                    <div className="students-table-wrapper">

                        <table className="students-table">

                            <thead>

                                <tr>

                                    <th>
                                        Student
                                    </th>

                                    <th>
                                        Roll Number
                                    </th>

                                    <th>
                                        Class
                                    </th>

                                    <th>
                                        Parent
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredStudents.map(
                                    (student) => (

                                        <tr
                                            key={
                                                student.id
                                            }
                                        >

                                            <td>

                                                <div className="student-name-cell">

                                                    <div className="student-avatar">

                                                        {getStudentName(
                                                            student
                                                        )
                                                            .charAt(0)
                                                            .toUpperCase()}

                                                    </div>


                                                    <div>

                                                        <strong>
                                                            {
                                                                getStudentName(
                                                                    student
                                                                )
                                                            }
                                                        </strong>

                                                        <span>
                                                            @
                                                            {
                                                                student.username
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            <td>

                                                <strong>
                                                    {
                                                        student.roll_number
                                                    }
                                                </strong>

                                            </td>


                                            <td>

                                                <div className="class-cell">

                                                    <strong>
                                                        {
                                                            student.program_code
                                                        }
                                                    </strong>

                                                    <span>
                                                        Section{" "}
                                                        {
                                                            student.section_name
                                                        }
                                                    </span>

                                                </div>

                                            </td>


                                            <td>

                                                <div className="parent-cell">

                                                    <strong>
                                                        {
                                                            student.parent_name
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            student.parent_phone
                                                        }
                                                    </span>

                                                </div>

                                            </td>


                                            <td>

                                                {student.is_active_student ? (

                                                    <span className="student-status active">

                                                        <UserCheck
                                                            size={14}
                                                        />

                                                        Active

                                                    </span>

                                                ) : (

                                                    <span className="student-status inactive">

                                                        <UserX
                                                            size={14}
                                                        />

                                                        Inactive

                                                    </span>

                                                )}

                                            </td>


                                            <td>

                                                <button
                                                    className={
                                                        student.is_active_student
                                                            ? "student-action deactivate"
                                                            : "student-action activate"
                                                    }
                                                    onClick={() =>
                                                        toggleStudentStatus(
                                                            student
                                                        )
                                                    }
                                                    title={
                                                        student.is_active_student
                                                            ? "Deactivate student"
                                                            : "Activate student"
                                                    }
                                                >

                                                    {student.is_active_student
                                                        ? (
                                                            <UserX
                                                                size={17}
                                                            />
                                                        )
                                                        : (
                                                            <UserCheck
                                                                size={17}
                                                            />
                                                        )}

                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =================================================
                ADD STUDENT MODAL
            ================================================= */}

            {showForm && (

                <div className="student-modal-overlay">

                    <div className="student-modal">


                        {/* HEADER */}

                        <div className="student-modal-header">

                            <div>

                                <h2>
                                    Add Student
                                </h2>

                                <p>
                                    Create a student account and profile
                                </p>

                            </div>


                            <button
                                type="button"
                                className="modal-close-button"
                                onClick={closeForm}
                            >

                                <X size={21} />

                            </button>

                        </div>


                        <form
                            className="student-form"
                            onSubmit={handleSubmit}
                        >


                            {/* =================================================
                                ACCOUNT
                            ================================================= */}

                            <div className="form-section-title">

                                Account Information

                            </div>


                            <div className="student-form-grid">


                                <div className="student-form-group">

                                    <label>
                                        Username *
                                    </label>

                                    <input
                                        type="text"
                                        name="username"
                                        value={
                                            form.username
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Student username"
                                        required
                                    />

                                </div>


                                <div className="student-form-group">

                                    <label>
                                        Password *
                                    </label>

                                    <input
                                        type="password"
                                        name="password"
                                        value={
                                            form.password
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Minimum 6 characters"
                                        minLength={6}
                                        required
                                    />

                                </div>


                                <div className="student-form-group">

                                    <label>
                                        Email *
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={
                                            form.email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="student@mgu.ac.in"
                                        required
                                    />

                                </div>

                            </div>


                            {/* =================================================
                                STUDENT
                            ================================================= */}

                            <div className="form-section-title">

                                Student Information

                            </div>


                            <div className="student-form-grid">


                                <div className="student-form-group">

                                    <label>
                                        First Name
                                    </label>

                                    <input
                                        type="text"
                                        name="first_name"
                                        value={
                                            form.first_name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="First name"
                                    />

                                </div>


                                <div className="student-form-group">

                                    <label>
                                        Last Name
                                    </label>

                                    <input
                                        type="text"
                                        name="last_name"
                                        value={
                                            form.last_name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Last name"
                                    />

                                </div>


                                <div className="student-form-group">

                                    <label>
                                        Roll Number *
                                    </label>

                                    <input
                                        type="text"
                                        name="roll_number"
                                        value={
                                            form.roll_number
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Example: 24AIML001"
                                        required
                                    />

                                </div>


                                <div className="student-form-group">

                                    <label>
                                        Admission Number
                                    </label>

                                    <input
                                        type="text"
                                        name="admission_number"
                                        value={
                                            form.admission_number
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Admission number"
                                    />

                                </div>


                                {/* SECTION DROPDOWN */}

                                <div className="student-form-group">

                                    <label>
                                        Section *
                                    </label>

                                    <select
                                        name="section"
                                        value={
                                            form.section
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        disabled={
                                            sectionsLoading
                                        }
                                    >

                                        <option value="">
                                            {sectionsLoading
                                                ? "Loading sections..."
                                                : sections.length === 0
                                                    ? "No sections available"
                                                    : "Select Section"}
                                        </option>


                                        {sections.map(
                                            (section) => (

                                                <option
                                                    key={
                                                        section.id
                                                    }
                                                    value={
                                                        section.id
                                                    }
                                                >

                                                    {section.program_code}
                                                    {" - "}
                                                    {section.program_name}

                                                    {" | "}

                                                    {section.academic_year_name}

                                                    {" | "}

                                                    {section.semester_name}

                                                    {" | Section "}

                                                    {section.name}

                                                </option>

                                            )
                                        )}

                                    </select>


                                    {!sectionsLoading &&
                                        sections.length === 0 && (

                                            <small>
                                                Create a section first from
                                                Classes → Sections.
                                            </small>

                                        )}

                                </div>

                            </div>


                            {/* =================================================
                                PARENT
                            ================================================= */}

                            <div className="form-section-title">

                                Parent Information

                            </div>


                            <div className="student-form-grid">


                                <div className="student-form-group">

                                    <label>
                                        Parent Name *
                                    </label>

                                    <input
                                        type="text"
                                        name="parent_name"
                                        value={
                                            form.parent_name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Parent / Guardian name"
                                        required
                                    />

                                </div>


                                <div className="student-form-group">

                                    <label>
                                        Parent Phone *
                                    </label>

                                    <input
                                        type="text"
                                        name="parent_phone"
                                        value={
                                            form.parent_phone
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Parent phone number"
                                        required
                                    />

                                </div>


                                <div className="student-form-group">

                                    <label>
                                        Parent Email
                                    </label>

                                    <input
                                        type="email"
                                        name="parent_email"
                                        value={
                                            form.parent_email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Parent email"
                                    />

                                </div>

                            </div>


                            {/* =================================================
                                STATUS
                            ================================================= */}

                            <label className="student-active-checkbox">

                                <input
                                    type="checkbox"
                                    name="is_active_student"
                                    checked={
                                        form.is_active_student
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                                <span>
                                    Student is active
                                </span>

                            </label>


                            {/* =================================================
                                ACTIONS
                            ================================================= */}

                            <div className="student-form-actions">

                                <button
                                    type="button"
                                    className="cancel-student-button"
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="save-student-button"
                                    disabled={
                                        saving ||
                                        sectionsLoading ||
                                        sections.length === 0
                                    }
                                >

                                    <Save size={18} />

                                    {saving
                                        ? "Creating..."
                                        : "Create Student"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}


export default AdminStudents;