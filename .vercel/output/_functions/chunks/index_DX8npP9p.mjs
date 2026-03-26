import { c as createComponent } from './astro-component_BtCFjQZe.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_CyO4XxjQ.mjs';
import { $ as $$AppLayout } from './AppLayout_9RuWQQJO.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { s as supabase } from './supabase_C4p1dVZL.mjs';
import { $ as $$AdminSidebar } from './AdminSidebar_CvKCxhaq.mjs';

function JobTitleList() {
  const [jobTitles, setJobTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(null);
  const [sectors, setSectors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [sectorId, setSectorId] = useState("");
  const [workSchedule, setWorkSchedule] = useState("");
  const [workModel, setWorkModel] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [seniorityLevel, setSeniorityLevel] = useState("");
  const [scheduleType, setScheduleType] = useState("");
  const [cboCode, setCboCode] = useState("");
  const [requirements, setRequirements] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  useEffect(() => {
    fetchJobTitles();
    fetchDepartments();
    fetchSectors();
  }, []);
  useEffect(() => {
    if (isModalOpen) {
      if (editingTitle) {
        setTitle(editingTitle.title);
        setDescription(editingTitle.description || "");
        setDepartmentId(editingTitle.department_id || "");
        setSectorId(editingTitle.sector_id || "");
        setWorkSchedule(editingTitle.work_schedule || "");
        setWorkModel(editingTitle.work_model || "");
        setSalaryMin(editingTitle.salary_min?.toString() || "");
        setSalaryMax(editingTitle.salary_max?.toString() || "");
        setSeniorityLevel(editingTitle.seniority_level || "");
        setScheduleType(editingTitle.schedule_type || "");
        setCboCode(editingTitle.cbo_code || "");
        setRequirements(editingTitle.requirements || "");
      } else {
        setTitle("");
        setDescription("");
        setDepartmentId("");
        setSectorId("");
        setWorkSchedule("");
        setWorkModel("");
        setSalaryMin("");
        setSalaryMax("");
        setSeniorityLevel("");
        setScheduleType("");
        setCboCode("");
        setRequirements("");
      }
    }
  }, [isModalOpen, editingTitle]);
  const fetchJobTitles = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const orgId = session.user.user_metadata.organization_id;
      const { data, error: error2 } = await supabase.from("job_titles").select("*, creator:profiles!created_by(full_name), sector:sectors(name)").eq("organization_id", orgId).order("title");
      if (error2) throw error2;
      setJobTitles(data || []);
    } catch (err) {
      console.error("Error fetching job titles:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const fetchDepartments = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const orgId = session.user.user_metadata.organization_id;
      const { data, error: error2 } = await supabase.from("departments").select("id, name").eq("organization_id", orgId).eq("is_active", true).order("name");
      if (error2) throw error2;
      setDepartments(data || []);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };
  const fetchSectors = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const orgId = session.user.user_metadata.organization_id;
      const { data, error: error2 } = await supabase.from("sectors").select("id, name, department_id").eq("organization_id", orgId).eq("is_active", true).order("name");
      if (error2) throw error2;
      setSectors(data || []);
    } catch (err) {
      console.error("Error fetching sectors:", err);
    }
  };
  const handleCboChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 6) value = value.slice(0, 6);
    if (value.length > 4) {
      value = value.replace(/(\d{4})(\d{1,2})/, "$1-$2");
    }
    setCboCode(value);
  };
  const handleWorkScheduleChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setWorkSchedule(value);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");
      const orgId = session.user.user_metadata.organization_id;
      const payload = {
        title,
        description,
        department_id: departmentId || null,
        sector_id: sectorId || null,
        work_schedule: workSchedule || null,
        work_model: workModel || null,
        salary_min: salaryMin ? parseFloat(salaryMin) : null,
        salary_max: salaryMax ? parseFloat(salaryMax) : null,
        seniority_level: seniorityLevel || null,
        schedule_type: scheduleType || null,
        cbo_code: cboCode || null,
        requirements: requirements || null
      };
      if (editingTitle) {
        const { error: error2 } = await supabase.from("job_titles").update(payload).eq("id", editingTitle.id);
        if (error2) throw error2;
      } else {
        const { error: error2 } = await supabase.from("job_titles").insert({
          ...payload,
          organization_id: orgId,
          created_by: session.user.id
        });
        if (error2) throw error2;
      }
      setIsModalOpen(false);
      fetchJobTitles();
    } catch (err) {
      alert("Error saving: " + err.message);
    } finally {
      setFormLoading(false);
    }
  };
  const handleToggleStatus = async (job) => {
    if (!confirm(`Deseja ${job.is_active ? "inativar" : "ativar"} este cargo?`)) return;
    try {
      const { error: error2 } = await supabase.from("job_titles").update({ is_active: !job.is_active }).eq("id", job.id);
      if (error2) throw error2;
      fetchJobTitles();
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };
  const formatCurrency = (value) => {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };
  if (loading) return /* @__PURE__ */ jsx("div", { className: "p-4", children: "Carregando..." });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-medium text-gray-900", children: "Cargos" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            setEditingTitle(null);
            setIsModalOpen(true);
          },
          className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand",
          children: "Novo Cargo"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Cargo / Nível" }),
        /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Setor" }),
        /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Modelo / Jornada" }),
        /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Faixa Salarial" }),
        /* @__PURE__ */ jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" }),
        /* @__PURE__ */ jsx("th", { scope: "col", className: "relative px-6 py-3", children: /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Ações" }) })
      ] }) }),
      /* @__PURE__ */ jsxs("tbody", { className: "bg-white divide-y divide-gray-200", children: [
        jobTitles.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 6, className: "px-6 py-12 text-center text-gray-500", children: "Nenhum cargo cadastrado." }) }),
        jobTitles.map((job) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50 transition-colors group", children: [
          /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 whitespace-nowrap", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-brand", children: job.title }),
            job.seniority_level && /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: job.seniority_level }),
            job.cbo_code && /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-400", children: [
              "CBO: ",
              job.cbo_code
            ] })
          ] }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-700", children: job.sector?.name || "-" }) }),
          /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 whitespace-nowrap", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-700", children: job.work_model || "-" }),
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500", children: [
              job.work_schedule ? `${job.work_schedule}h/sem` : "-",
              job.schedule_type ? ` (${job.schedule_type})` : ""
            ] })
          ] }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-700", children: [
            job.salary_min ? formatCurrency(job.salary_min) : "",
            job.salary_min && job.salary_max ? " - " : "",
            job.salary_max ? formatCurrency(job.salary_max) : "",
            !job.salary_min && !job.salary_max && "-"
          ] }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("span", { className: `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${job.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`, children: job.is_active ? "Ativo" : "Inativo" }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "text-brand hover:text-brand-dark",
                title: "Editar",
                onClick: () => {
                  setEditingTitle(job);
                  setIsModalOpen(true);
                },
                children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }) })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleToggleStatus(job),
                className: "text-red-600 hover:text-red-900",
                title: job.is_active ? "Inativar" : "Ativar",
                children: job.is_active ? /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) }) : /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" }) })
              }
            )
          ] }) })
        ] }, job.id))
      ] })
    ] }) }) }),
    isModalOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", "aria-labelledby": "modal-title", role: "dialog", "aria-modal": "true", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0", children: [
      /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 transition-opacity", "aria-hidden": "true", onClick: () => setIsModalOpen(false) }),
      /* @__PURE__ */ jsx("div", { className: "relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg leading-6 font-medium text-gray-900 mb-4", id: "modal-title", children: editingTitle ? "Editar Cargo" : "Novo Cargo" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "title", className: "block text-sm font-medium text-gray-700", children: "Título do Cargo" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    id: "title",
                    required: true,
                    className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm",
                    value: title,
                    onChange: (e) => setTitle(e.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "department", className: "block text-sm font-medium text-gray-700", children: "Departamento" }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    id: "department",
                    className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm",
                    value: departmentId,
                    onChange: (e) => {
                      setDepartmentId(e.target.value);
                      setSectorId("");
                    },
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "", children: "Selecione..." }),
                      departments.map((dept) => /* @__PURE__ */ jsx("option", { value: dept.id, children: dept.name }, dept.id))
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "sector", className: "block text-sm font-medium text-gray-700", children: "Setor" }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    id: "sector",
                    className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm",
                    value: sectorId,
                    onChange: (e) => {
                      const selectedSectorId = e.target.value;
                      setSectorId(selectedSectorId);
                      if (selectedSectorId) {
                        const sector = sectors.find((s) => s.id === selectedSectorId);
                        if (sector && sector.department_id) {
                          setDepartmentId(sector.department_id);
                        }
                      }
                    },
                    disabled: !departmentId,
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "", children: "Sem setor específico" }),
                      sectors.filter((s) => !departmentId || s.department_id === departmentId).map((sector) => /* @__PURE__ */ jsx("option", { value: sector.id, children: sector.name }, sector.id))
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "seniority", className: "block text-sm font-medium text-gray-700", children: "Nível de Senioridade" }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    id: "seniority",
                    className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm",
                    value: seniorityLevel,
                    onChange: (e) => setSeniorityLevel(e.target.value),
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "", children: "Selecione..." }),
                      /* @__PURE__ */ jsx("option", { value: "Estagiário", children: "Estagiário" }),
                      /* @__PURE__ */ jsx("option", { value: "Jovem Aprendiz", children: "Jovem Aprendiz" }),
                      /* @__PURE__ */ jsx("option", { value: "Auxiliar", children: "Auxiliar" }),
                      /* @__PURE__ */ jsx("option", { value: "Assistente", children: "Assistente" }),
                      /* @__PURE__ */ jsx("option", { value: "Analista Jr", children: "Analista Jr" }),
                      /* @__PURE__ */ jsx("option", { value: "Analista Pl", children: "Analista Pl" }),
                      /* @__PURE__ */ jsx("option", { value: "Analista Sr", children: "Analista Sr" }),
                      /* @__PURE__ */ jsx("option", { value: "Especialista", children: "Especialista" }),
                      /* @__PURE__ */ jsx("option", { value: "Coordenador", children: "Coordenador" }),
                      /* @__PURE__ */ jsx("option", { value: "Gerente", children: "Gerente" }),
                      /* @__PURE__ */ jsx("option", { value: "Diretor", children: "Diretor" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "cbo", className: "block text-sm font-medium text-gray-700", children: "CBO" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    id: "cbo",
                    className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm",
                    value: cboCode,
                    onChange: handleCboChange,
                    placeholder: "0000-00",
                    maxLength: 7
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { htmlFor: "workModel", className: "block text-sm font-medium text-gray-700", children: "Modelo" }),
                  /* @__PURE__ */ jsxs(
                    "select",
                    {
                      id: "workModel",
                      className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm",
                      value: workModel,
                      onChange: (e) => setWorkModel(e.target.value),
                      children: [
                        /* @__PURE__ */ jsx("option", { value: "", children: "Selecione..." }),
                        /* @__PURE__ */ jsx("option", { value: "Presencial", children: "Presencial" }),
                        /* @__PURE__ */ jsx("option", { value: "Híbrido", children: "Híbrido" }),
                        /* @__PURE__ */ jsx("option", { value: "Remoto", children: "Remoto" }),
                        /* @__PURE__ */ jsx("option", { value: "Remoto", children: "Remoto" })
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { htmlFor: "scheduleType", className: "block text-sm font-medium text-gray-700", children: "Escala de Trabalho" }),
                  /* @__PURE__ */ jsxs(
                    "select",
                    {
                      id: "scheduleType",
                      className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm",
                      value: scheduleType,
                      onChange: (e) => setScheduleType(e.target.value),
                      children: [
                        /* @__PURE__ */ jsx("option", { value: "", children: "Selecione..." }),
                        /* @__PURE__ */ jsx("option", { value: "5x2", children: "5x2" }),
                        /* @__PURE__ */ jsx("option", { value: "6x1", children: "6x1" }),
                        /* @__PURE__ */ jsx("option", { value: "12x36", children: "12x36" }),
                        /* @__PURE__ */ jsx("option", { value: "24x48", children: "24x48" }),
                        /* @__PURE__ */ jsx("option", { value: "Outra", children: "Outra" })
                      ]
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "workSchedule", className: "block text-sm font-medium text-gray-700", children: "Carga Horária Semanal (horas)" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    id: "workSchedule",
                    className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm",
                    value: workSchedule,
                    onChange: handleWorkScheduleChange,
                    placeholder: "Ex: 44"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Faixa Salarial (R$)" }),
                /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mt-1", children: [
                  /* @__PURE__ */ jsxs("div", { className: "relative rounded-md shadow-sm w-full", children: [
                    /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: /* @__PURE__ */ jsx("span", { className: "text-gray-500 sm:text-sm", children: "R$" }) }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "number",
                        name: "salaryMin",
                        id: "salaryMin",
                        className: "focus:ring-brand focus:border-brand block w-full pl-7 py-2 sm:text-sm border border-gray-300 rounded-md shadow-sm",
                        placeholder: "Mínimo",
                        value: salaryMin,
                        onChange: (e) => setSalaryMin(e.target.value)
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "relative rounded-md shadow-sm w-full", children: [
                    /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: /* @__PURE__ */ jsx("span", { className: "text-gray-500 sm:text-sm", children: "R$" }) }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "number",
                        name: "salaryMax",
                        id: "salaryMax",
                        className: "focus:ring-brand focus:border-brand block w-full pl-7 py-2 sm:text-sm border border-gray-300 rounded-md shadow-sm",
                        placeholder: "Máximo",
                        value: salaryMax,
                        onChange: (e) => setSalaryMax(e.target.value)
                      }
                    )
                  ] })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "description", className: "block text-sm font-medium text-gray-700", children: "Descrição" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  id: "description",
                  rows: 3,
                  className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm",
                  value: description,
                  onChange: (e) => setDescription(e.target.value)
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "requirements", className: "block text-sm font-medium text-gray-700", children: "Requisitos" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  id: "requirements",
                  rows: 3,
                  className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm",
                  value: requirements,
                  onChange: (e) => setRequirements(e.target.value),
                  placeholder: "Principais competências e requisitos..."
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: formLoading,
              className: "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand text-base font-medium text-white hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50",
              children: formLoading ? "Salvando..." : "Salvar"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm",
              onClick: () => setIsModalOpen(false),
              children: "Cancelar"
            }
          )
        ] })
      ] }) })
    ] }) })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Gerenciar - Cargos" }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> ${renderComponent($$result2, "JobTitleList", JobTitleList, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/OneDrive/TatuTec/gerenciar/src/modules/admin/job-titles/components/JobTitleList", "client:component-export": "default" })} </div> `, "sidebar": ($$result2) => renderTemplate`${renderComponent($$result2, "AdminSidebar", $$AdminSidebar, { "slot": "sidebar" })}` })}`;
}, "D:/OneDrive/TatuTec/gerenciar/src/pages/admin/job-titles/index.astro", void 0);

const $$file = "D:/OneDrive/TatuTec/gerenciar/src/pages/admin/job-titles/index.astro";
const $$url = "/admin/job-titles";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
