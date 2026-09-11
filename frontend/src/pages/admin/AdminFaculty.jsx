import { useEffect, useState } from "react";

import {
    Users,
    Plus,
    Search,
    X,
    Save,
    UserCheck,
    UserX
} from "lucide-react";

import api from "../../services/api";


function AdminFaculty() {

    const [faculty, setFaculty] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [showForm, setShowForm] = useState(false);

    const [error, setError] = useState("");


    const emptyForm = {
        username: "",
        password: "",
        email: "",
        first_name: "",
        last_name: "",
        faculty_id: "",
        department: "",
        designation: ""
    };


    const [form, setForm] =
        useState(emptyForm);


    const getToken = () => {

        return localStorage.getItem(
            "access_token"
        );

    };


    // =====================================================
    // LOAD FACULTY
    // =====================================================

    const loadFaculty = async () => {

        try {

            const response = await api.get(
                "/academics/admin/faculty/"
            );

            setFaculty(
                response.data
            );

        } catch (err) {

            console.error(
                "Faculty loading error:",
                err
            );

            setError(
                err.response?.data?.detail ||
                "Unable to load faculty."
            );

        }

    };


    // =====================================================
    // LOAD DEPARTMENTS
    // =====================================================

    const loadDepartments = async () => {

        try {

            const response = await api.get(
                "/academics/admin/departments/"
            );

            setDepartments(
                response.data
            );

        } catch (err) {

            console.error(
                "Department loading error:",
                err
            );

        }

    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        const loadData = async () => {

            try {

                setLoading(true);

                setError("");

                await Promise.all([
                    loadFaculty(),
                    loadDepartments()
                ]);

            } finally {

                setLoading(false);

            }

        };


        loadData();

    }, []);


    // =====================================================
    // FORM CHANGE
    // =====================================================

    const handleChange = (
        event
    ) => {

        const {
            name,
            value
        } = event.target;


        setForm(
            (previous) => ({
                ...previous,
                [name]: value
            })
        );

    };


    // =====================================================
    // OPEN FORM
    // =====================================================

    const openForm = () => {

        setError("");

        setForm(
            emptyForm
        );

        setShowForm(
            true
        );

    };


    // =====================================================
    // CLOSE FORM
    // =====================================================

    const closeForm = () => {

        if (saving) {
            return;
        }

        setShowForm(
            false
        );

        setForm(
            emptyForm
        );

    };


    // =====================================================
    // CREATE FACULTY
    // =====================================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setSaving(true);

        setError("");


        try {

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

                faculty_id:
                    form.faculty_id.trim(),

                department:
                    form.department
                        ? Number(
                              form.department
                          )
                        : null,

                designation:
                    form.designation.trim()

            };


            await api.post(
                "/academics/admin/faculty/",
                data
            );


            alert(
                "Faculty created successfully."
            );


            setForm(
                emptyForm
            );

            setShowForm(
                false
            );


            await loadFaculty();


        } catch (err) {

            console.error(
                "Faculty creation error:",
                err
            );


            const data =
                err.response?.data;


            if (
                data &&
                typeof data ===
                    "object"
            ) {

                const messages =
                    Object.entries(
                        data
                    ).map(
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
                    messages.join(
                        " | "
                    )
                );

            } else {

                setError(
                    "Unable to create faculty."
                );

            }

        } finally {

            setSaving(false);

        }

    };


    // =====================================================
    // ACTIVATE / DEACTIVATE
    // =====================================================

    const toggleStatus = async (
        member
    ) => {

        try {

            await api.patch(
                `/academics/admin/faculty/${member.id}/`,
                {
                    is_active:
                        !member.is_active
                }
            );


            await loadFaculty();

        } catch (err) {

            console.error(
                err
            );

            alert(
                "Unable to update faculty status."
            );

        }

    };


    // =====================================================
    // SEARCH
    // =====================================================

    const filteredFaculty =
        faculty.filter(
            (member) => {

                const text =
                    `${member.first_name || ""} ${
                        member.last_name || ""
                    } ${
                        member.username || ""
                    } ${
                        member.faculty_id || ""
                    } ${
                        member.department_code || ""
                    } ${
                        member.department_name || ""
                    } ${
                        member.designation || ""
                    }`.toLowerCase();


                return text.includes(
                    search.toLowerCase()
                );

            }
        );


    // =====================================================
    // NAME
    // =====================================================

    const getName = (
        member
    ) => {

        const name =
            `${member.first_name || ""} ${
                member.last_name || ""
            }`.trim();


        return (
            name ||
            member.username
        );

    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="admin-faculty-page">


            {/* HEADER */}

            <div className="faculty-page-header">

                <div>

                    <h2>
                        Manage Faculty
                    </h2>

                    <p>
                        Manage faculty accounts and information
                    </p>

                </div>


                <button
                    className="faculty-add-button"
                    onClick={openForm}
                >

                    <Plus size={18} />

                    Add Faculty

                </button>

            </div>


            {/* ERROR */}

            {error && (

                <div className="faculty-error">

                    {error}

                </div>

            )}


            {/* TOOLBAR */}

            <div className="faculty-toolbar">

                <div className="faculty-search">

                    <Search
                        size={18}
                    />

                    <input
                        type="text"
                        placeholder="Search faculty..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>


                <div className="faculty-count">

                    <Users
                        size={18}
                    />

                    {filteredFaculty.length}
                    {" "}Faculty

                </div>

            </div>


            {/* TABLE */}

            <div className="faculty-table-card">

                {loading ? (

                    <div className="faculty-loading">
                        Loading faculty...
                    </div>

                ) : filteredFaculty.length === 0 ? (

                    <div className="faculty-empty">

                        <Users
                            size={45}
                        />

                        <h3>
                            No faculty found
                        </h3>

                        <p>
                            Add a faculty member to get started.
                        </p>

                    </div>

                ) : (

                    <div className="faculty-table-wrapper">

                        <table className="faculty-table">

                            <thead>

                                <tr>

                                    <th>
                                        Faculty
                                    </th>

                                    <th>
                                        Faculty ID
                                    </th>

                                    <th>
                                        Department
                                    </th>

                                    <th>
                                        Designation
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

                                {filteredFaculty.map(
                                    (member) => (

                                        <tr
                                            key={
                                                member.id
                                            }
                                        >

                                            <td>

                                                <div className="faculty-name-cell">

                                                    <div className="faculty-avatar">

                                                        {getName(
                                                            member
                                                        )
                                                            .charAt(
                                                                0
                                                            )
                                                            .toUpperCase()}

                                                    </div>


                                                    <div>

                                                        <strong>
                                                            {
                                                                getName(
                                                                    member
                                                                )
                                                            }
                                                        </strong>

                                                        <span>
                                                            @
                                                            {
                                                                member.username
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            <td>

                                                <strong>
                                                    {
                                                        member.faculty_id
                                                    }
                                                </strong>

                                            </td>


                                            <td>

                                                {member.department_code
                                                    ? `${member.department_code} - ${member.department_name}`
                                                    : "Not assigned"}

                                            </td>


                                            <td>
                                                {
                                                    member.designation ||
                                                    "Not specified"
                                                }
                                            </td>


                                            <td>

                                                {member.is_active ? (

                                                    <span className="faculty-status active">

                                                        <UserCheck
                                                            size={14}
                                                        />

                                                        Active

                                                    </span>

                                                ) : (

                                                    <span className="faculty-status inactive">

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
                                                        member.is_active
                                                            ? "faculty-action deactivate"
                                                            : "faculty-action activate"
                                                    }
                                                    onClick={() =>
                                                        toggleStatus(
                                                            member
                                                        )
                                                    }
                                                >

                                                    {member.is_active
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


            {/* =====================================================
                ADD FACULTY MODAL
            ===================================================== */}

            {showForm && (

                <div className="faculty-modal-overlay">

                    <div className="faculty-modal">


                        <div className="faculty-modal-header">

                            <div>

                                <h2>
                                    Add Faculty
                                </h2>

                                <p>
                                    Create a faculty login and profile
                                </p>

                            </div>


                            <button
                                type="button"
                                className="faculty-modal-close"
                                onClick={closeForm}
                            >

                                <X
                                    size={20}
                                />

                            </button>

                        </div>


                        <form
                            className="faculty-form"
                            onSubmit={
                                handleSubmit
                            }
                        >


                            {/* ACCOUNT */}

                            <div className="faculty-section-title">

                                Account Information

                            </div>


                            <div className="faculty-form-grid">


                                <div className="faculty-form-group">

                                    <label>
                                        Username *
                                    </label>

                                    <input
                                        name="username"
                                        value={
                                            form.username
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        placeholder="Faculty username"
                                    />

                                </div>


                                <div className="faculty-form-group">

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
                                        minLength={
                                            6
                                        }
                                        required
                                        placeholder="Minimum 6 characters"
                                    />

                                </div>


                                <div className="faculty-form-group">

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
                                        required
                                        placeholder="faculty@mgu.ac.in"
                                    />

                                </div>

                            </div>


                            {/* FACULTY INFORMATION */}

                            <div className="faculty-section-title">

                                Faculty Information

                            </div>


                            <div className="faculty-form-grid">


                                <div className="faculty-form-group">

                                    <label>
                                        First Name *
                                    </label>

                                    <input
                                        name="first_name"
                                        value={
                                            form.first_name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        placeholder="First name"
                                    />

                                </div>


                                <div className="faculty-form-group">

                                    <label>
                                        Last Name
                                    </label>

                                    <input
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


                                <div className="faculty-form-group">

                                    <label>
                                        Faculty ID *
                                    </label>

                                    <input
                                        name="faculty_id"
                                        value={
                                            form.faculty_id
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        placeholder="Example: FAC001"
                                    />

                                </div>


                                <div className="faculty-form-group">

                                    <label>
                                        Department
                                    </label>

                                    <select
                                        name="department"
                                        value={
                                            form.department
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="">
                                            Select Department
                                        </option>


                                        {departments.map(
                                            (
                                                department
                                            ) => (

                                                <option
                                                    key={
                                                        department.id
                                                    }
                                                    value={
                                                        department.id
                                                    }
                                                >

                                                    {
                                                        department.code
                                                    }
                                                    {" - "}
                                                    {
                                                        department.name
                                                    }

                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                <div className="faculty-form-group faculty-full-width">

                                    <label>
                                        Designation
                                    </label>

                                    <input
                                        name="designation"
                                        value={
                                            form.designation
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Example: Assistant Professor"
                                    />

                                </div>

                            </div>


                            {/* ACTIONS */}

                            <div className="faculty-form-actions">

                                <button
                                    type="button"
                                    className="faculty-cancel-button"
                                    onClick={closeForm}
                                    disabled={
                                        saving
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="faculty-save-button"
                                    disabled={
                                        saving
                                    }
                                >

                                    <Save
                                        size={17}
                                    />

                                    {saving
                                        ? "Creating..."
                                        : "Create Faculty"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

}


export default AdminFaculty;