import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { s as supabase } from './supabase_C4p1dVZL.mjs';
import { P as ProcessService } from './AppLayout_9RuWQQJO.mjs';
import { ChevronDown, FileText } from 'lucide-react';
import { fetchUserPermissions } from './permissions_CCDHY6zh.mjs';

const DepartmentSection = ({ group, isCollapsed, currentId }) => {
  const hasActiveProcess = group.processes.some((p) => p.id === currentId || p.code === currentId);
  const [isOpen, setIsOpen] = useState(hasActiveProcess);
  useEffect(() => {
    if (hasActiveProcess) {
      setIsOpen(true);
    }
  }, [currentId, hasActiveProcess]);
  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };
  return /* @__PURE__ */ jsxs("div", { className: `w-full space-y-1 ${isCollapsed ? "flex flex-col items-center border-t border-gray-100 pt-3 relative" : ""}`, children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: toggleOpen,
        className: `w-full flex items-center justify-between cursor-pointer ${isCollapsed ? "justify-center hover:bg-gray-50 rounded-md p-1" : "hover:bg-gray-50 rounded-md py-1.5"}`,
        title: group.name,
        children: [
          isCollapsed ? /* @__PURE__ */ jsxs("div", { className: "mb-1 relative", children: [
            /* @__PURE__ */ jsx("div", { className: "h-6 w-6 rounded-md bg-gray-100 flex items-center justify-center text-gray-500 font-medium text-xs", children: group.name.substring(0, 2).toUpperCase() }),
            /* @__PURE__ */ jsx("span", { className: `absolute -bottom-2 -right-2 transform scale-75 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`, children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-3 w-3 text-gray-400" }) })
          ] }) : /* @__PURE__ */ jsx("div", { className: "px-3 text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2", children: group.name }),
          !isCollapsed && /* @__PURE__ */ jsx(
            ChevronDown,
            {
              className: `h-4 w-4 text-text-tertiary mr-2 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: `
                space-y-1 
                ${!isCollapsed ? `ml-2 border-l border-gray-200 pl-2 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}` : `w-full flex flex-col items-center space-y-2 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[1000px] opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"}`}
            `, children: group.processes.length > 0 ? group.processes.map((process) => {
      const isActive = currentId === process.id || currentId === process.code;
      const href = process.current_version ? `/processes/${process.code || process.id}` : `/processes/${process.id}/editar`;
      return /* @__PURE__ */ jsx(
        "a",
        {
          href,
          title: isCollapsed ? process.title : "",
          className: `block rounded-md transition-colors ${isCollapsed ? "p-2 flex justify-center hover:bg-gray-100" : `px-3 py-2 text-sm font-medium ${isActive ? "bg-white text-brand border border-gray-200 shadow-sm" : "text-text-secondary hover:bg-gray-100 hover:text-text-primary"}`} ${isCollapsed && isActive ? "bg-white text-brand border border-gray-200 shadow-sm" : ""}`,
          children: isCollapsed ? /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5 text-gray-400" }) : /* @__PURE__ */ jsx("span", { className: "line-clamp-1", children: process.title })
        },
        process.id
      );
    }) : !isCollapsed && /* @__PURE__ */ jsx("span", { className: "block px-3 py-2 text-xs text-text-tertiary italic", children: "Sem processos" }) })
  ] });
};
function ProcessSidebar() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentId, setCurrentId] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("process_sidebar_collapsed") === "true";
    }
    return false;
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("process_sidebar_collapsed", String(isCollapsed));
    }
  }, [isCollapsed]);
  useEffect(() => {
    const pathParts = window.location.pathname.split("/");
    if (pathParts[1] === "processes" && pathParts[2] && pathParts[2] !== "novo") {
      setCurrentId(pathParts[2]);
    }
    async function fetchData() {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const { data: profile } = await supabase.from("profiles").select("organization_id, organization_role_id").eq("id", session.user.id).single();
        if (!profile?.organization_id) return;
        const { isOrgAdmin } = await fetchUserPermissions(session.user.id);
        let processes = await ProcessService.listProcesses(profile.organization_id);
        if (!isOrgAdmin) {
          processes = processes.filter((process) => {
            const viewerRoles = process.viewer_roles || [];
            const editorRoles = process.editor_roles || [];
            if (viewerRoles.length === 0) return true;
            if (!profile.organization_role_id) return false;
            const isViewer = viewerRoles.some((vr) => vr.organization_role_id === profile.organization_role_id);
            const isEditor = editorRoles.some((er) => er.organization_role_id === profile.organization_role_id);
            return isViewer || isEditor;
          });
        }
        const groupedMap = /* @__PURE__ */ new Map();
        processes.forEach((process) => {
          const deptName = process.department?.name || "Sem Departamento";
          const deptId = deptName.toLowerCase().replace(/\s+/g, "-");
          if (!groupedMap.has(deptId)) {
            groupedMap.set(deptId, {
              id: deptId,
              name: deptName,
              processes: []
            });
          }
          groupedMap.get(deptId).processes.push(process);
        });
        const groupedArray = Array.from(groupedMap.values()).sort((a, b) => {
          if (a.name === "Sem Departamento") return 1;
          if (b.name === "Sem Departamento") return -1;
          return a.name.localeCompare(b.name);
        });
        setDepartments(groupedArray);
      } catch (error) {
        console.error("Error fetching process sidebar data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "p-4 text-xs text-text-secondary animate-pulse w-64", children: "Carregando processos..." });
  }
  return /* @__PURE__ */ jsxs(
    "aside",
    {
      className: `${isCollapsed ? "w-16" : "w-64"} h-full bg-gray-50/50 border-r border-gray-200 flex flex-col shrink-0 transition-all duration-300 relative group/sidebar z-20`,
      children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setIsCollapsed(!isCollapsed),
            className: "absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50 text-text-secondary z-10 transition-transform md:opacity-0 md:group-hover/sidebar:opacity-100",
            title: isCollapsed ? "Expandir menu" : "Recolher menu",
            children: isCollapsed ? /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z", clipRule: "evenodd" }) }) : /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z", clipRule: "evenodd" }) })
          }
        ),
        /* @__PURE__ */ jsx("div", { className: `flex flex-col h-full py-4 ${isCollapsed ? "px-2 items-center" : "px-4"} space-y-6 overflow-y-auto overflow-x-hidden`, children: departments.map((dept) => /* @__PURE__ */ jsx(
          DepartmentSection,
          {
            group: dept,
            isCollapsed,
            currentId
          },
          dept.id
        )) })
      ]
    }
  );
}

export { ProcessSidebar as P };
