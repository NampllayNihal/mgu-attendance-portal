import { useEffect, useState } from "react";
import {
    Building2,
    BookOpen,
    CalendarDays,
    Layers,
    School,
    Plus,
    Search,
    X,
    Save,
    Trash2
} from "lucide-react";

import api from "../../services/api";


function AdminClasses() {

    const [activeTab, setActiveTab] =
        useState("Departments");

    const [departments, setDepartments] =
        useState([]);

    const [programs, setPrograms] =
        useState([]);

    const [academicYears, setAcademicYears] =
        useState([]);

    const [semesters, setSemesters] =
        useState([]);

    const [sections, setSections] =
        useState([]);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [showForm, setShowForm] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [search, setSearch] =
        useState("");


    // =========================================================
    // FORM
    // =========================================================

    const emptyForm = {
        name: "",
        code: "",
        department: "",
        year: "",
        is_current: false,
        number: "",
        program: "",
        academic_year: "",
        semester: ""
    };

    const [form, setForm] =
        useState(emptyForm);


    // =========================================================
    // TOKEN
    // =========================================================

    const getToken = () =>
        localStorage.getItem(
            "access_token"
        );


    // =========================================================
    // LOAD DATA
    // =========================================================

    const loadDepartments = async () => {

        const response = await api.get(
            "/academics/admin/departments/",
            {
                headers: {
                    Authorization:
                        `Bearer ${getToken()}`
                }
            }
        );

        setDepartments(
            response.data
        );
    };


    const loadPrograms = async () => {

        const response = await api.get(
            "/academics/admin/programs/",
            {
                headers: {
                    Authorization:
                        `Bearer ${getToken()}`
                }
            }
        );

        setPrograms(
            response.data
        );
    };


    const loadAcademicYears = async () => {

        const response = await api.get(
            "/academics/admin/academic-years/",
            {
                headers: {
                    Authorization:
                        `Bearer ${getToken()}`
                }
            }
        );

        setAcademicYears(
            response.data
        );
    };


    const loadSemesters = async () => {

        const response = await api.get(
            "/academics/admin/semesters/",
            {
                headers: {
                    Authorization:
                        `Bearer ${getToken()}`
                }
            }
        );

        setSemesters(
            response.data
        );
    };


    const loadSections = async () => {

        const response = await api.get(
            "/academics/admin/sections/",
            {
                headers: {
                    Authorization:
                        `Bearer ${getToken()}`
                }
            }
        );

        setSections(
            response.data
        );
    };


    const loadAllData = async () => {

        try {

            setLoading(true);
            setError("");

            await Promise.all([
                loadDepartments(),
                loadPrograms(),
                loadAcademicYears(),
                loadSemesters(),
                loadSections()
            ]);

        } catch (err) {

            console.error(
                "Academic data error:",
                err
            );

            setError(
                err.response?.data?.detail ||
                "Unable to load academic information."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadAllData();

    }, []);


    // =========================================================
    // FORM CHANGE
    // =========================================================

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


    // =========================================================
    // OPEN FORM
    // =========================================================

    const openAddForm = () => {

        setError("");

        setForm(emptyForm);

        setShowForm(true);
    };


    // =========================================================
    // CLOSE FORM
    // =========================================================

    const closeForm = () => {

        if (saving) {
            return;
        }

        setShowForm(false);

        setForm(emptyForm);
    };


    // =========================================================
    // CREATE
    // =========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setSaving(true);
        setError("");

        try {

            const token =
                getToken();


            let url = "";
            let data = {};


            // -------------------------------------------------
            // DEPARTMENT
            // -------------------------------------------------

            if (
                activeTab ===
                "Departments"
            ) {

                url =
                    "/academics/admin/departments/";

                data = {
                    name:
                        form.name.trim(),

                    code:
                        form.code.trim().toUpperCase()
                };
            }


            // -------------------------------------------------
            // PROGRAM
            // -------------------------------------------------

            else if (
                activeTab ===
                "Programs"
            ) {

                url =
                    "/academics/admin/programs/";

                data = {
                    department:
                        Number(form.department),

                    name:
                        form.name.trim(),

                    code:
                        form.code.trim().toUpperCase()
                };
            }


            // -------------------------------------------------
            // ACADEMIC YEAR
            // -------------------------------------------------

            else if (
                activeTab ===
                "Academic Years"
            ) {

                url =
                    "/academics/admin/academic-years/";

                data = {
                    year:
                        form.year.trim(),

                    is_current:
                        form.is_current
                };
            }


            // -------------------------------------------------
            // SEMESTER
            // -------------------------------------------------

            else if (
                activeTab ===
                "Semesters"
            ) {

                url =
                    "/academics/admin/semesters/";

                data = {
                    number:
                        Number(form.number),

                    name:
                        form.name.trim()
                };
            }


            // -------------------------------------------------
            // SECTION
            // -------------------------------------------------

            else if (
                activeTab ===
                "Sections"
            ) {

                url =
                    "/academics/admin/sections/";

                data = {
                    program:
                        Number(form.program),

                    academic_year:
                        Number(
                            form.academic_year
                        ),

                    semester:
                        Number(
                            form.semester
                        ),

                    name:
                        form.name.trim()
                };
            }


            await api.post(
                url,
                data,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            alert(
                `${activeTab.slice(
                    0,
                    -1
                )} created successfully.`
            );


            setShowForm(false);

            setForm(emptyForm);

            await loadAllData();


        } catch (err) {

            console.error(
                "Create error:",
                err
            );


            const responseData =
                err.response?.data;


            if (
                responseData &&
                typeof responseData ===
                    "object"
            ) {

                const messages =
                    Object.entries(
                        responseData
                    ).map(
                        ([field, message]) =>
                            `${field}: ${
                                Array.isArray(
                                    message
                                )
                                    ? message.join(
                                          ", "
                                      )
                                    : message
                            }`
                    );

                setError(
                    messages.join(" | ")
                );

            } else {

                setError(
                    "Unable to create record."
                );
            }

        } finally {

            setSaving(false);

        }
    };


    // =========================================================
    // TAB CHANGE
    // =========================================================

    const handleTabChange = (tab) => {

        setActiveTab(tab);

        setSearch("");

        setError("");

        setShowForm(false);

        setForm(emptyForm);
    };


    // =========================================================
    // TAB CONFIG
    // =========================================================

    const tabs = [
        {
            name: "Departments",
            icon: Building2
        },
        {
            name: "Programs",
            icon: BookOpen
        },
        {
            name: "Academic Years",
            icon: CalendarDays
        },
        {
            name: "Semesters",
            icon: Layers
        },
        {
            name: "Sections",
            icon: School
        }
    ];


    // =========================================================
    // FILTER
    // =========================================================

    let displayedData = [];

    if (
        activeTab ===
        "Departments"
    ) {
        displayedData =
            departments.filter(
                (item) =>
                    `${item.name} ${item.code}`
                        .toLowerCase()
                        .includes(
                            search.toLowerCase()
                        )
            );
    }

    else if (
        activeTab ===
        "Programs"
    ) {
        displayedData =
            programs.filter(
                (item) =>
                    `${item.name} ${
                        item.code
                    } ${
                        item.department_name
                    }`
                        .toLowerCase()
                        .includes(
                            search.toLowerCase()
                        )
            );
    }

    else if (
        activeTab ===
        "Academic Years"
    ) {
        displayedData =
            academicYears.filter(
                (item) =>
                    item.year
                        .toLowerCase()
                        .includes(
                            search.toLowerCase()
                        )
            );
    }

    else if (
        activeTab ===
        "Semesters"
    ) {
        displayedData =
            semesters.filter(
                (item) =>
                    `${item.number} ${
                        item.name
                    }`
                        .toLowerCase()
                        .includes(
                            search.toLowerCase()
                        )
            );
    }

    else if (
        activeTab ===
        "Sections"
    ) {
        displayedData =
            sections.filter(
                (item) =>
                    `${item.name} ${
                        item.program_code
                    } ${
                        item.program_name
                    } ${
                        item.academic_year_name
                    } ${
                        item.semester_name
                    }`
                        .toLowerCase()
                        .includes(
                            search.toLowerCase()
                        )
            );
    }


    // =========================================================
    // FORM TITLE
    // =========================================================

    const getFormTitle = () => {

        if (
            activeTab ===
            "Departments"
        ) {
            return "Add Department";
        }

        if (
            activeTab ===
            "Programs"
        ) {
            return "Add Program";
        }

        if (
            activeTab ===
            "Academic Years"
        ) {
            return "Add Academic Year";
        }

        if (
            activeTab ===
            "Semesters"
        ) {
            return "Add Semester";
        }

        return "Add Section";
    };


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="admin-classes-page">


            {/* =====================================================
                PAGE HEADER
            ===================================================== */}

            <div className="classes-page-header">

                <div>

                    <h2>
                        Manage Classes
                    </h2>

                    <p>
                        Manage departments,
                        programs and academic
                        structure
                    </p>

                </div>


                <button
                    className="classes-add-button"
                    onClick={
                        openAddForm
                    }
                >

                    <Plus size={18} />

                    Add{" "}
                    {
                        activeTab ===
                        "Academic Years"
                            ? "Academic Year"
                            : activeTab.slice(
                                  0,
                                  -1
                              )
                    }

                </button>

            </div>


            {/* =====================================================
                ERROR
            ===================================================== */}

            {error && (

                <div className="classes-error">

                    {error}

                </div>

            )}


            {/* =====================================================
                TABS
            ===================================================== */}

            <div className="classes-tabs">

                {tabs.map((tab) => {

                    const Icon =
                        tab.icon;

                    const active =
                        activeTab ===
                        tab.name;

                    return (

                        <button
                            key={
                                tab.name
                            }
                            className={
                                active
                                    ? "classes-tab classes-tab-active"
                                    : "classes-tab"
                            }
                            onClick={() =>
                                handleTabChange(
                                    tab.name
                                )
                            }
                        >

                            <Icon
                                size={17}
                            />

                            <span>
                                {tab.name}
                            </span>

                        </button>

                    );

                })}

            </div>


            {/* =====================================================
                TOOLBAR
            ===================================================== */}

            <div className="classes-toolbar">

                <div className="classes-search">

                    <Search
                        size={18}
                    />

                    <input
                        type="text"
                        placeholder={`Search ${activeTab.toLowerCase()}...`}
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>


                <div className="classes-count">

                    {displayedData.length}{" "}
                    {activeTab}

                </div>

            </div>


            {/* =====================================================
                TABLE
            ===================================================== */}

            <div className="classes-table-card">

                {loading ? (

                    <div className="classes-loading">

                        Loading...

                    </div>

                ) : displayedData.length ===
                  0 ? (

                    <div className="classes-empty">

                        <School
                            size={40}
                        />

                        <h3>
                            No{" "}
                            {activeTab.toLowerCase()}
                            found
                        </h3>

                        <p>
                            Click the Add button
                            to create one.
                        </p>

                    </div>

                ) : (

                    <div className="classes-table-wrapper">

                        <table className="classes-table">

                            <thead>

                                <tr>

                                    {activeTab ===
                                        "Departments" && (
                                        <>
                                            <th>
                                                Code
                                            </th>

                                            <th>
                                                Department
                                            </th>
                                        </>
                                    )}


                                    {activeTab ===
                                        "Programs" && (
                                        <>
                                            <th>
                                                Code
                                            </th>

                                            <th>
                                                Program
                                            </th>

                                            <th>
                                                Department
                                            </th>
                                        </>
                                    )}


                                    {activeTab ===
                                        "Academic Years" && (
                                        <>
                                            <th>
                                                Academic Year
                                            </th>

                                            <th>
                                                Current
                                            </th>
                                        </>
                                    )}


                                    {activeTab ===
                                        "Semesters" && (
                                        <>
                                            <th>
                                                Number
                                            </th>

                                            <th>
                                                Semester
                                            </th>
                                        </>
                                    )}


                                    {activeTab ===
                                        "Sections" && (
                                        <>
                                            <th>
                                                Program
                                            </th>

                                            <th>
                                                Academic Year
                                            </th>

                                            <th>
                                                Semester
                                            </th>

                                            <th>
                                                Section
                                            </th>
                                        </>
                                    )}

                                </tr>

                            </thead>


                            <tbody>

                                {displayedData.map(
                                    (item) => (

                                        <tr
                                            key={
                                                item.id
                                            }
                                        >

                                            {activeTab ===
                                                "Departments" && (
                                                <>
                                                    <td>
                                                        <strong>
                                                            {
                                                                item.code
                                                            }
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {
                                                            item.name
                                                        }
                                                    </td>
                                                </>
                                            )}


                                            {activeTab ===
                                                "Programs" && (
                                                <>
                                                    <td>
                                                        <strong>
                                                            {
                                                                item.code
                                                            }
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {
                                                            item.name
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            item.department_code
                                                        }{" "}
                                                        -{" "}
                                                        {
                                                            item.department_name
                                                        }
                                                    </td>
                                                </>
                                            )}


                                            {activeTab ===
                                                "Academic Years" && (
                                                <>
                                                    <td>
                                                        <strong>
                                                            {
                                                                item.year
                                                            }
                                                        </strong>
                                                    </td>

                                                    <td>

                                                        {item.is_current ? (

                                                            <span className="current-badge">
                                                                Current
                                                            </span>

                                                        ) : (

                                                            <span className="normal-badge">
                                                                -
                                                            </span>

                                                        )}

                                                    </td>
                                                </>
                                            )}


                                            {activeTab ===
                                                "Semesters" && (
                                                <>
                                                    <td>
                                                        <strong>
                                                            Semester{" "}
                                                            {
                                                                item.number
                                                            }
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {
                                                            item.name
                                                        }
                                                    </td>
                                                </>
                                            )}


                                            {activeTab ===
                                                "Sections" && (
                                                <>
                                                    <td>

                                                        <strong>
                                                            {
                                                                item.program_code
                                                            }
                                                        </strong>

                                                        <span className="table-subtext">
                                                            {
                                                                item.program_name
                                                            }
                                                        </span>

                                                    </td>

                                                    <td>
                                                        {
                                                            item.academic_year_name
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            item.semester_name
                                                        }
                                                    </td>

                                                    <td>

                                                        <span className="section-badge">
                                                            Section{" "}
                                                            {
                                                                item.name
                                                            }
                                                        </span>

                                                    </td>
                                                </>
                                            )}

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =====================================================
                ADD MODAL
            ===================================================== */}

            {showForm && (

                <div className="classes-modal-overlay">

                    <div className="classes-modal">

                        <div className="classes-modal-header">

                            <div>

                                <h2>
                                    {
                                        getFormTitle()
                                    }
                                </h2>

                                <p>
                                    Enter the required
                                    information
                                </p>

                            </div>


                            <button
                                className="classes-modal-close"
                                onClick={
                                    closeForm
                                }
                            >

                                <X size={20} />

                            </button>

                        </div>


                        <form
                            className="classes-form"
                            onSubmit={
                                handleSubmit
                            }
                        >


                            {/* =================================================
                                DEPARTMENT
                            ================================================= */}

                            {activeTab ===
                                "Departments" && (

                                <>

                                    <div className="classes-form-group">

                                        <label>
                                            Department Name *
                                        </label>

                                        <input
                                            name="name"
                                            value={
                                                form.name
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Example: Computer Science"
                                            required
                                        />

                                    </div>


                                    <div className="classes-form-group">

                                        <label>
                                            Department Code *
                                        </label>

                                        <input
                                            name="code"
                                            value={
                                                form.code
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Example: CSE"
                                            required
                                        />

                                    </div>

                                </>
                            )}


                            {/* =================================================
                                PROGRAM
                            ================================================= */}

                            {activeTab ===
                                "Programs" && (

                                <>

                                    <div className="classes-form-group">

                                        <label>
                                            Department *
                                        </label>

                                        <select
                                            name="department"
                                            value={
                                                form.department
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
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
                                                        }{" "}
                                                        -{" "}
                                                        {
                                                            department.name
                                                        }

                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>


                                    <div className="classes-form-group">

                                        <label>
                                            Program Name *
                                        </label>

                                        <input
                                            name="name"
                                            value={
                                                form.name
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Example: Artificial Intelligence and Machine Learning"
                                            required
                                        />

                                    </div>


                                    <div className="classes-form-group">

                                        <label>
                                            Program Code *
                                        </label>

                                        <input
                                            name="code"
                                            value={
                                                form.code
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Example: AIML"
                                            required
                                        />

                                    </div>

                                </>
                            )}


                            {/* =================================================
                                ACADEMIC YEAR
                            ================================================= */}

                            {activeTab ===
                                "Academic Years" && (

                                <>

                                    <div className="classes-form-group">

                                        <label>
                                            Academic Year *
                                        </label>

                                        <input
                                            name="year"
                                            value={
                                                form.year
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Example: 2026-2027"
                                            required
                                        />

                                    </div>


                                    <label className="classes-checkbox">

                                        <input
                                            type="checkbox"
                                            name="is_current"
                                            checked={
                                                form.is_current
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                        <span>
                                            Set as current
                                            academic year
                                        </span>

                                    </label>

                                </>
                            )}


                            {/* =================================================
                                SEMESTER
                            ================================================= */}

                            {activeTab ===
                                "Semesters" && (

                                <>

                                    <div className="classes-form-group">

                                        <label>
                                            Semester Number *
                                        </label>

                                        <input
                                            type="number"
                                            name="number"
                                            value={
                                                form.number
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Example: 1"
                                            min="1"
                                            required
                                        />

                                    </div>


                                    <div className="classes-form-group">

                                        <label>
                                            Semester Name *
                                        </label>

                                        <input
                                            name="name"
                                            value={
                                                form.name
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Example: Semester 1"
                                            required
                                        />

                                    </div>

                                </>
                            )}


                            {/* =================================================
                                SECTION
                            ================================================= */}

                            {activeTab ===
                                "Sections" && (

                                <>

                                    <div className="classes-form-group">

                                        <label>
                                            Program *
                                        </label>

                                        <select
                                            name="program"
                                            value={
                                                form.program
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        >

                                            <option value="">
                                                Select Program
                                            </option>

                                            {programs.map(
                                                (
                                                    program
                                                ) => (

                                                    <option
                                                        key={
                                                            program.id
                                                        }
                                                        value={
                                                            program.id
                                                        }
                                                    >

                                                        {
                                                            program.code
                                                        }{" "}
                                                        -{" "}
                                                        {
                                                            program.name
                                                        }

                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>


                                    <div className="classes-form-group">

                                        <label>
                                            Academic Year *
                                        </label>

                                        <select
                                            name="academic_year"
                                            value={
                                                form.academic_year
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        >

                                            <option value="">
                                                Select Academic Year
                                            </option>

                                            {academicYears.map(
                                                (
                                                    year
                                                ) => (

                                                    <option
                                                        key={
                                                            year.id
                                                        }
                                                        value={
                                                            year.id
                                                        }
                                                    >

                                                        {
                                                            year.year
                                                        }

                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>


                                    <div className="classes-form-group">

                                        <label>
                                            Semester *
                                        </label>

                                        <select
                                            name="semester"
                                            value={
                                                form.semester
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        >

                                            <option value="">
                                                Select Semester
                                            </option>

                                            {semesters.map(
                                                (
                                                    semester
                                                ) => (

                                                    <option
                                                        key={
                                                            semester.id
                                                        }
                                                        value={
                                                            semester.id
                                                        }
                                                    >

                                                        {
                                                            semester.name
                                                        }

                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>


                                    <div className="classes-form-group">

                                        <label>
                                            Section Name *
                                        </label>

                                        <input
                                            name="name"
                                            value={
                                                form.name
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Example: A"
                                            maxLength={
                                                20
                                            }
                                            required
                                        />

                                    </div>

                                </>
                            )}


                            {/* =================================================
                                ACTIONS
                            ================================================= */}

                            <div className="classes-form-actions">

                                <button
                                    type="button"
                                    className="classes-cancel-button"
                                    onClick={
                                        closeForm
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="classes-save-button"
                                    disabled={
                                        saving
                                    }
                                >

                                    <Save
                                        size={17}
                                    />

                                    {saving
                                        ? "Saving..."
                                        : "Save"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}


export default AdminClasses;