import { c as createComponent } from './astro-component_BtCFjQZe.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_CyO4XxjQ.mjs';
import { $ as $$AppLayout } from './AppLayout_9RuWQQJO.mjs';
import { $ as $$AdminSidebar } from './AdminSidebar_CvKCxhaq.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { s as supabase } from './supabase_C4p1dVZL.mjs';

function DataUploader({ onDataLoaded, expectedColumns }) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);
  const processFile = (file) => {
    setFileName(file.name);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        if (json.length === 0) {
          setError("O arquivo selecionado está vazio.");
          return;
        }
        if (expectedColumns && expectedColumns.length > 0) {
          const firstRow = json[0];
          const foundColumns = Object.keys(firstRow);
          const missing = expectedColumns.filter((c) => !foundColumns.includes(c));
          if (missing.length > 0) {
            setError(`Faltam colunas obrigatórias: ${missing.join(", ")}`);
            return;
          }
        }
        onDataLoaded(json);
      } catch (err) {
        console.error("Erro ao ler planilha:", err);
        const msg = err.message || "Erro desconhecido";
        setError(`Falha ao ler o arquivo: ${msg} (Verifique as colunas e o formato)`);
      }
    };
    reader.onerror = () => {
      setError("Falha ao ler o arquivo localmente.");
    };
    reader.readAsArrayBuffer(file);
  };
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [expectedColumns]);
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
        className: `w-full flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${isDragging ? "border-brand bg-brand-light/10" : "border-gray-300 bg-white"}`,
        children: /* @__PURE__ */ jsxs("div", { className: "space-y-1 text-center", children: [
          /* @__PURE__ */ jsx(
            "svg",
            {
              className: "mx-auto h-12 w-12 text-gray-400",
              stroke: "currentColor",
              fill: "none",
              viewBox: "0 0 48 48",
              "aria-hidden": "true",
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  d: "M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4-4m4-24h8m-4-4v8m-12 4h.02",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                }
              )
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex text-sm text-text-secondary justify-center", children: [
            /* @__PURE__ */ jsxs(
              "label",
              {
                htmlFor: "file-upload",
                className: "relative cursor-pointer rounded-md bg-white font-medium text-brand focus-within:outline-none focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-2 hover:text-brand-dark",
                children: [
                  /* @__PURE__ */ jsx("span", { children: "Selecione um arquivo" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      id: "file-upload",
                      name: "file-upload",
                      type: "file",
                      className: "sr-only",
                      accept: ".xlsx, .xls, .csv",
                      onChange: handleFileChange
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "pl-1", children: "ou arraste e solte" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-text-tertiary", children: "Arquivos suportados: XLSX, XLS, CSV formatado (< 10MB)" })
        ] })
      }
    ),
    fileName && !error && /* @__PURE__ */ jsxs("div", { className: "mt-2 text-sm text-green-600 flex items-center", children: [
      /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M5 13l4 4L19 7" }) }),
      "Arquivo carregado: ",
      /* @__PURE__ */ jsx("span", { className: "font-semibold ml-1", children: fileName })
    ] }),
    error && /* @__PURE__ */ jsxs("div", { className: "mt-2 text-sm text-red-600 flex items-center bg-red-50 p-2 rounded", children: [
      /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 mr-1 shrink-0", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
      /* @__PURE__ */ jsx("span", { children: error })
    ] })
  ] });
}

class MigrationValidationService {
  // 1. Pessoais Base
  static validatePessoaisBase(data) {
    const errors = [];
    const validData = [];
    const seenEmail = /* @__PURE__ */ new Set();
    const seenCpf = /* @__PURE__ */ new Set();
    data.forEach((row, index) => {
      const line = index + 2;
      let hasError = false;
      if (!row.email) {
        errors.push({ line, error: "A coluna 'email' é obrigatória." });
        hasError = true;
      }
      if (!row.nome) {
        errors.push({ line, error: "A coluna 'nome' é obrigatória." });
        hasError = true;
      }
      if (!row.cpf) {
        errors.push({ line, error: "A coluna 'cpf' é obrigatória." });
        hasError = true;
      }
      const email = row.email ? String(row.email).toLowerCase().trim() : null;
      const cpf = row.cpf ? MigrationValidationService.cleanFormat(row.cpf) : null;
      if (email) {
        if (seenEmail.has(email)) {
          errors.push({ line, error: `Email duplicado na planilha: ${email}` });
          hasError = true;
        } else {
          seenEmail.add(email);
        }
      }
      if (cpf) {
        if (seenCpf.has(cpf)) {
          errors.push({ line, error: `CPF duplicado na planilha: ${row.cpf}` });
          hasError = true;
        } else {
          seenCpf.add(cpf);
        }
      }
      if (!hasError) validData.push({ ...row, email, cpf });
    });
    return { isValid: errors.length === 0, validData, errors };
  }
  // 2. Cargos
  static validateRoles(data) {
    const errors = [];
    const validData = [];
    const seenNames = /* @__PURE__ */ new Set();
    data.forEach((row, index) => {
      const line = index + 2;
      const nome = row.nome_cargo?.toString().trim();
      if (!nome) {
        errors.push({ line, error: "A coluna 'nome_cargo' é obrigatória." });
        return;
      }
      const lowerName = nome.toLowerCase();
      if (seenNames.has(lowerName)) {
        errors.push({ line, error: `Cargo duplicado na planilha: ${nome}` });
        return;
      }
      seenNames.add(lowerName);
      validData.push(row);
    });
    return { isValid: errors.length === 0, validData, errors };
  }
  // 3. Departamentos
  static validateDepartments(data) {
    const errors = [];
    const validData = [];
    const seenNames = /* @__PURE__ */ new Set();
    data.forEach((row, index) => {
      const line = index + 2;
      const nome = row.nome_departamento?.toString().trim();
      if (!nome) {
        errors.push({ line, error: "A coluna 'nome_departamento' é obrigatória." });
        return;
      }
      const lowerName = nome.toLowerCase();
      if (seenNames.has(lowerName)) {
        errors.push({ line, error: `Departamento duplicado na planilha: ${nome}` });
        return;
      }
      seenNames.add(lowerName);
      validData.push(row);
    });
    return { isValid: errors.length === 0, validData, errors };
  }
  // 4. Setores
  static validateSectors(data) {
    const errors = [];
    const validData = [];
    const seenCombo = /* @__PURE__ */ new Set();
    data.forEach((row, index) => {
      const line = index + 2;
      const nomeSetor = row.nome_setor?.toString().trim();
      const nomeDepto = row.nome_departamento?.toString().trim();
      if (!nomeSetor) {
        errors.push({ line, error: "A coluna 'nome_setor' é obrigatória." });
        return;
      }
      if (!nomeDepto) {
        errors.push({ line, error: "A coluna 'nome_departamento' é obrigatória para vincular o setor." });
        return;
      }
      const combo = `${nomeDepto.toLowerCase()}|${nomeSetor.toLowerCase()}`;
      if (seenCombo.has(combo)) {
        errors.push({ line, error: `Setor duplicado no mesmo departamento na planilha.` });
        return;
      }
      seenCombo.add(combo);
      validData.push(row);
    });
    return { isValid: errors.length === 0, validData, errors };
  }
  // 5. Associações
  static validateAssociations(data) {
    const errors = [];
    const validData = [];
    data.forEach((row, index) => {
      const line = index + 2;
      let hasError = false;
      const email = row.email?.toString().toLowerCase().trim();
      const cpf = row.cpf ? MigrationValidationService.cleanFormat(row.cpf) : null;
      if (!email && !cpf) {
        errors.push({ line, error: "A coluna 'email' ou 'cpf' é obrigatória para identificar quem será associado." });
        hasError = true;
      }
      if (!row.cargo && !row.departamento && !row.setor && !row.lider_email) {
        errors.push({ line, error: "Nenhuma associação solicitada (cargo, departamento, setor, lider_email vazios)." });
        hasError = true;
      }
      if (!hasError) validData.push({ ...row, email, cpf });
    });
    return { isValid: errors.length === 0, validData, errors };
  }
  static cleanFormat(value) {
    if (!value) return "";
    return String(value).replace(/[^\d\w]/g, "");
  }
}

class MigrationInsertService {
  // 1. Pessoais Base
  static async insertPessoaisBase(users, organizationId) {
    const results = { success: 0, errors: [] };
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      results.errors.push("Sessão expirada ou não encontrada.");
      return results;
    }
    const { data: existingProfiles } = await supabase.from("profiles").select("email, cpf").eq("organization_id", organizationId);
    const existingEmails = new Set(existingProfiles?.map((p) => p.email?.toLowerCase().trim()));
    const existingCpfs = new Set(existingProfiles?.map((p) => p.cpf?.replace(/[^\d\w]/g, "")));
    const BATCH_SIZE = 5;
    const DELAY_BETWEEN_BATCHES_MS = 500;
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async (user) => {
        try {
          const email = user.email?.toLowerCase().trim();
          const cpf = user.cpf ? String(user.cpf).replace(/[^\d\w]/g, "") : null;
          if (email && existingEmails.has(email)) {
            results.errors.push(`Aviso: O email ${email} já está cadastrado nesta organização e foi ignorado na criação base.`);
            return { status: "rejected", reason: "Email já cadastrado" };
          }
          if (cpf && existingCpfs.has(cpf)) {
            results.errors.push(`Aviso: O CPF ${user.cpf} já está associado a alguém nesta organização e foi ignorado.`);
            return { status: "rejected", reason: "CPF já cadastrado" };
          }
          const response = await fetch("/api/users/invite", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              fullName: user.nome,
              email: user.email,
              cpf: user.cpf || null,
              birthDate: user.data_nascimento || null,
              gender: user.genero || null,
              organization_id: organizationId,
              role: "user",
              jobTitle: null,
              department: null,
              sector: null,
              managerId: null
            })
          });
          const data = await response.json();
          if (!response.ok) {
            results.errors.push(`Usuário ${user.email}: ${data.error || "Erro ao convidar usuário"}`);
            return { status: "rejected", reason: data.error };
          } else {
            results.success++;
            return { status: "fulfilled", value: data };
          }
        } catch (err) {
          results.errors.push(`Falha de rede ao convidar ${user.email}: ${err.message}`);
          return { status: "rejected", reason: err.message };
        }
      });
      await Promise.allSettled(batchPromises);
      if (i + BATCH_SIZE < users.length) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS));
      }
    }
    return results;
  }
  // 2. Cargos
  static async insertRoles(roles, organizationId) {
    const results = { success: 0, errors: [] };
    try {
      const payload = roles.map((r) => ({
        organization_id: organizationId,
        title: r.nome_cargo,
        is_active: true
      }));
      const { data, error } = await supabase.from("job_titles").upsert(payload, { onConflict: "organization_id,title" }).select();
      if (error) throw error;
      results.success = payload.length;
    } catch (err) {
      console.error("Erro na importação de cargos:", err);
      results.errors.push(err.message || "Erro desconhecido ao inserir lote de cargos.");
    }
    return results;
  }
  // 3. Departamentos
  static async insertDepartments(departments, organizationId) {
    const results = { success: 0, errors: [] };
    try {
      const payload = departments.map((d) => ({
        organization_id: organizationId,
        name: d.nome_departamento,
        is_active: true
      }));
      const { data, error } = await supabase.from("departments").upsert(payload, { onConflict: "organization_id,name" }).select();
      if (error) throw error;
      results.success = payload.length;
    } catch (err) {
      console.error("Erro na importação de departamentos:", err);
      results.errors.push(err.message || "Erro desconhecido ao inserir lote de departamentos.");
    }
    return results;
  }
  // 4. Setores
  static async insertSectors(sectors, organizationId) {
    const results = { success: 0, errors: [] };
    try {
      const { data: depts } = await supabase.from("departments").select("id, name").eq("organization_id", organizationId);
      const deptMap = /* @__PURE__ */ new Map();
      depts?.forEach((d) => deptMap.set(d.name.toLowerCase().trim(), d.id));
      const payload = [];
      for (const s of sectors) {
        const deptName = s.nome_departamento?.toString().toLowerCase().trim();
        const deptId = deptMap.get(deptName);
        if (!deptId) {
          results.errors.push(`Setor ${s.nome_setor}: Departamento '${s.nome_departamento}' não encontrado.`);
          continue;
        }
        payload.push({
          organization_id: organizationId,
          department_id: deptId,
          name: s.nome_setor,
          is_active: true
        });
      }
      if (payload.length > 0) {
        const { data, error } = await supabase.from("sectors").upsert(payload).select();
        if (error) throw error;
        results.success = payload.length;
      }
    } catch (err) {
      console.error("Erro na importação de setores:", err);
      results.errors.push(err.message || "Erro ao inserir setores.");
    }
    return results;
  }
  // 5. Associações
  static async updateAssociations(associations, organizationId) {
    const results = { success: 0, errors: [] };
    try {
      const [
        { data: jobTitles },
        { data: departments },
        { data: sectors },
        { data: orgRoles },
        { data: profiles }
      ] = await Promise.all([
        supabase.from("job_titles").select("id, title").eq("organization_id", organizationId),
        supabase.from("departments").select("id, name").eq("organization_id", organizationId),
        supabase.from("sectors").select("id, name").eq("organization_id", organizationId),
        supabase.from("organization_roles").select("id, name").eq("organization_id", organizationId),
        supabase.from("profiles").select("id, email, cpf").eq("organization_id", organizationId)
      ]);
      const jtMap = new Map(jobTitles?.map((j) => [j.title.toLowerCase().trim(), j.id]));
      const deptMap = new Map(departments?.map((d) => [d.name.toLowerCase().trim(), d.id]));
      const sectorMap = new Map(sectors?.map((s) => [s.name.toLowerCase().trim(), s.id]));
      const roleMap = new Map(orgRoles?.map((r) => [r.name.toLowerCase().trim(), r.id]));
      const userEmailMap = new Map(profiles?.filter((p) => p.email).map((p) => [p.email.toLowerCase().trim(), p.id]));
      const userCpfMap = /* @__PURE__ */ new Map();
      profiles?.forEach((p) => {
        if (p.cpf) {
          userCpfMap.set(p.cpf.replace(/[^\d\w]/g, ""), p.id);
        }
      });
      for (const row of associations) {
        const rawEmail = row.email?.toString().toLowerCase().trim();
        const rawCpf = row.cpf ? row.cpf.toString().replace(/[^\d\w]/g, "") : null;
        const rawCargo = row.cargo?.toString().toLowerCase().trim();
        const rawDepto = row.departamento?.toString().toLowerCase().trim();
        const rawSetor = row.setor?.toString().toLowerCase().trim();
        const rawLiderEmail = row.lider_email?.toString().toLowerCase().trim();
        const rawRole = row.perfil_de_acesso?.toString().toLowerCase().trim();
        const userId = rawEmail && userEmailMap.get(rawEmail) || rawCpf && userCpfMap.get(rawCpf);
        if (!userId) {
          results.errors.push(`Usuário não encontrado: Email=${rawEmail} / CPF=${rawCpf}`);
          continue;
        }
        const updatePayload = {};
        if (rawCargo) {
          const jtId = jtMap.get(rawCargo);
          if (jtId) updatePayload.job_title = jtId;
          else results.errors.push(`${rawEmail || rawCpf}: Cargo '${row.cargo}' não encontrado.`);
        }
        if (rawDepto) {
          const dId = deptMap.get(rawDepto);
          if (dId) updatePayload.department = dId;
          else results.errors.push(`${rawEmail || rawCpf}: Departamento '${row.departamento}' não encontrado.`);
        }
        if (rawSetor) {
          const sId = sectorMap.get(rawSetor);
          if (sId) updatePayload.sector = sId;
          else results.errors.push(`${rawEmail || rawCpf}: Setor '${row.setor}' não encontrado.`);
        }
        if (rawLiderEmail) {
          const mId = userEmailMap.get(rawLiderEmail);
          if (mId) updatePayload.manager_id = mId;
          else results.errors.push(`${rawEmail || rawCpf}: Líder '${row.lider_email}' não encontrado.`);
        }
        if (rawRole) {
          const rId = roleMap.get(rawRole);
          if (rId) updatePayload.organization_role_id = rId;
          else results.errors.push(`${rawEmail || rawCpf}: Perfil de Acesso '${row.perfil_de_acesso}' não encontrado. Cadastre o Perfil de Acesso primeiro.`);
        }
        if (Object.keys(updatePayload).length > 0) {
          const { error } = await supabase.from("profiles").update(updatePayload).eq("id", userId);
          if (error) {
            results.errors.push(`Erro ao atualizar ${rawEmail || rawCpf}: ${error.message}`);
          } else {
            results.success++;
          }
        }
      }
    } catch (err) {
      console.error("Erro na atualização de associações:", err);
      results.errors.push(err.message || "Erro desconhecido ao processar vínculos.");
    }
    return results;
  }
}

function MigrationManager() {
  const MIGRATION_STEPS = [
    {
      id: "pessoais",
      title: "Pessoas (Base)",
      description: "Carregue a planilha básica (*cpf*, *email*, *nome*). Opcionais: *data_nascimento* e *genero*.",
      expectedColumns: ["cpf", "email", "nome"],
      validationAction: MigrationValidationService.validatePessoaisBase,
      apiAction: MigrationInsertService.insertPessoaisBase
    },
    {
      id: "roles",
      title: "Cargos",
      description: "Carregue a planilha contendo a estrutura de cargos (*nome_cargo*).",
      expectedColumns: ["nome_cargo"],
      dependsOn: ["pessoais"],
      validationAction: MigrationValidationService.validateRoles,
      apiAction: MigrationInsertService.insertRoles
    },
    {
      id: "departments",
      title: "Departamentos",
      description: "Planilha de departamentos (*nome_departamento*).",
      expectedColumns: ["nome_departamento"],
      dependsOn: ["pessoais", "roles"],
      validationAction: MigrationValidationService.validateDepartments,
      apiAction: MigrationInsertService.insertDepartments
    },
    {
      id: "sectors",
      title: "Setores",
      description: "Planilha de setores vinculados aos departamentos (*nome_setor*, *nome_departamento*).",
      expectedColumns: ["nome_setor", "nome_departamento"],
      dependsOn: ["pessoais", "roles", "departments"],
      validationAction: MigrationValidationService.validateSectors,
      apiAction: MigrationInsertService.insertSectors
    },
    {
      id: "associations",
      title: "Associações (Tudo)",
      description: "Relacione o *email* ou *cpf* com *cargo*, *departamento*, *setor*, *lider_email*. Opcional: *perfil_de_acesso* (O nome da permissão).",
      expectedColumns: ["email", "cargo", "departamento", "setor", "lider_email"],
      dependsOn: ["pessoais", "roles", "departments", "sectors"],
      validationAction: MigrationValidationService.validateAssociations,
      apiAction: MigrationInsertService.updateAssociations
    }
  ];
  const [activeTab, setActiveTab] = useState(MIGRATION_STEPS[0].id);
  const [stepData, setStepData] = useState({});
  const [stepValidation, setStepValidation] = useState({});
  const [stepStatus, setStepStatus] = useState(
    MIGRATION_STEPS.reduce((acc, step) => ({ ...acc, [step.id]: "pending" }), {})
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [globalFeedback, setGlobalFeedback] = useState(null);
  const activeStepConfig = MIGRATION_STEPS.find((s) => s.id === activeTab);
  const areDependenciesMet = (step) => {
    if (!step.dependsOn || step.dependsOn.length === 0) return true;
    return step.dependsOn.every((depId) => stepStatus[depId] === "success");
  };
  const handleDataLoaded = (data) => {
    setGlobalFeedback(null);
    const result = activeStepConfig.validationAction(data);
    setStepValidation((prev) => ({ ...prev, [activeStepConfig.id]: result }));
    setStepData((prev) => ({ ...prev, [activeStepConfig.id]: result.validData }));
    setStepStatus((prev) => ({ ...prev, [activeStepConfig.id]: "pending" }));
  };
  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([activeStepConfig.expectedColumns]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Modelo");
    XLSX.writeFile(wb, `modelo_importacao_${activeStepConfig.id}.xlsx`);
  };
  const handleImport = async () => {
    const dataToImport = stepData[activeStepConfig.id];
    if (!dataToImport || dataToImport.length === 0) return;
    setIsProcessing(true);
    setGlobalFeedback(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessão inválida.");
      const orgId = session.user.user_metadata?.organization_id;
      const results = await activeStepConfig.apiAction(dataToImport, orgId);
      if (results.errors.length > 0) {
        if (results.success > 0) {
          setGlobalFeedback({ type: "warning", message: `Importação parcial de ${activeStepConfig.title}. ${results.success} inseridos, ${results.errors.length} erros.`, details: results.errors });
          setStepStatus((prev) => ({ ...prev, [activeStepConfig.id]: "success" }));
        } else {
          setGlobalFeedback({ type: "error", message: `Falha na importação de ${activeStepConfig.title}. Nenhum registro inserido.`, details: results.errors });
          setStepStatus((prev) => ({ ...prev, [activeStepConfig.id]: "error" }));
        }
      } else {
        setGlobalFeedback({ type: "success", message: `${results.success} registros de ${activeStepConfig.title} importados com sucesso!` });
        setStepStatus((prev) => ({ ...prev, [activeStepConfig.id]: "success" }));
        setStepData((prev) => ({ ...prev, [activeStepConfig.id]: [] }));
        const currentIndex = MIGRATION_STEPS.findIndex((s) => s.id === activeStepConfig.id);
        if (currentIndex < MIGRATION_STEPS.length - 1) {
          setTimeout(() => setActiveTab(MIGRATION_STEPS[currentIndex + 1].id), 2e3);
        }
      }
    } catch (error) {
      setGlobalFeedback({ type: "error", message: `Erro fatal: ${error.message}` });
      setStepStatus((prev) => ({ ...prev, [activeStepConfig.id]: "error" }));
    } finally {
      setIsProcessing(false);
    }
  };
  const getPreviewHeaders = (data) => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  };
  const currentData = stepData[activeStepConfig.id] || [];
  const currentValidation = stepValidation[activeStepConfig.id];
  const dependenciesMet = areDependenciesMet(activeStepConfig);
  return /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]", children: [
    /* @__PURE__ */ jsxs("div", { className: "w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50/50 flex flex-col pt-4", children: [
      /* @__PURE__ */ jsx("div", { className: "px-4 pb-4 border-b border-gray-200 mb-2", children: /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-gray-700 uppercase tracking-wider", children: "Passos de Migração" }) }),
      /* @__PURE__ */ jsx("nav", { className: "flex-1 space-y-2 px-3 py-2", children: MIGRATION_STEPS.map((step, index) => {
        const isActive = activeTab === step.id;
        const isSuccess = stepStatus[step.id] === "success";
        const hasUnmetDeps = !areDependenciesMet(step);
        return /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setActiveTab(step.id),
            disabled: hasUnmetDeps && !isActive,
            className: `w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all text-left group
                                    ${isActive ? "bg-brand/10 text-brand shadow border border-brand/20 rings-2 ring-brand/10" : "text-text-secondary hover:text-text-primary hover:bg-gray-100 border border-transparent"} ${hasUnmetDeps ? "opacity-50 cursor-not-allowed" : ""}`,
            children: [
              /* @__PURE__ */ jsx("div", { className: "flex-1 flex overflow-hidden flex-col gap-1", children: /* @__PURE__ */ jsxs("span", { className: "truncate flex items-center", children: [
                /* @__PURE__ */ jsx("span", { className: `w-6 h-6 mr-3 inline-flex items-center justify-center border rounded-full text-xs font-bold shrink-0 shadow-sm transition-colors ${isActive ? "bg-brand text-white border-brand" : "bg-white text-gray-500 border-gray-300 group-hover:border-gray-400"}`, children: index + 1 }),
                step.title
              ] }) }),
              isSuccess && /* @__PURE__ */ jsx("span", { className: "ml-2 text-green-600 shrink-0", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M5 13l4 4L19 7" }) }) })
            ]
          },
          step.id
        );
      }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 p-6 lg:p-8 bg-white overflow-y-auto", children: [
      globalFeedback && /* @__PURE__ */ jsxs("div", { className: `mb-6 p-4 rounded-md text-sm ${globalFeedback.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : globalFeedback.type === "warning" ? "bg-yellow-50 text-yellow-800 border border-yellow-200" : "bg-red-50 text-red-800 border border-red-200"}`, children: [
        /* @__PURE__ */ jsxs("div", { className: "font-semibold flex items-center", children: [
          globalFeedback.type === "success" ? "✅" : globalFeedback.type === "warning" ? "⚠️" : "❌",
          /* @__PURE__ */ jsx("span", { className: "ml-2", children: globalFeedback.message })
        ] }),
        globalFeedback.details && globalFeedback.details.length > 0 && /* @__PURE__ */ jsxs("ul", { className: "list-disc pl-5 text-xs max-h-40 overflow-y-auto mt-2 space-y-1", children: [
          globalFeedback.details.slice(0, 10).map((err, i) => /* @__PURE__ */ jsx("li", { children: typeof err === "string" ? err : JSON.stringify(err) }, i)),
          globalFeedback.details.length > 10 && /* @__PURE__ */ jsxs("li", { className: "font-bold text-gray-600", children: [
            "...e mais ",
            globalFeedback.details.length - 10,
            " erros ocultos."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6 animate-in fade-in flex flex-col", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-lg font-semibold text-text-primary flex items-center gap-2", children: [
            "Migração de ",
            activeStepConfig.title,
            !dependenciesMet && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800", children: [
              "Bloqueado: Requer ",
              activeStepConfig.dependsOn?.map((id) => MIGRATION_STEPS.find((s) => s.id === id)?.title).join(", ")
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-text-secondary", children: activeStepConfig.description }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: handleDownloadTemplate,
                className: "inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand",
                children: [
                  /* @__PURE__ */ jsx("svg", { className: "-ml-0.5 mr-2 h-4 w-4 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" }) }),
                  "Baixar Modelo XLSX"
                ]
              }
            )
          ] })
        ] }),
        !dependenciesMet ? /* @__PURE__ */ jsx("div", { className: "p-8 text-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50", children: /* @__PURE__ */ jsxs("p", { className: "text-gray-500", children: [
          "Você precisa concluir as importações anteriores (",
          /* @__PURE__ */ jsx("strong", { children: activeStepConfig.dependsOn?.map((id) => MIGRATION_STEPS.find((s) => s.id === id)?.title).join(", ") }),
          ") antes de enviar arquivos para ",
          activeStepConfig.title.toLowerCase(),
          "."
        ] }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            DataUploader,
            {
              onDataLoaded: handleDataLoaded,
              expectedColumns: activeStepConfig.expectedColumns
            }
          ),
          currentValidation?.errors && currentValidation.errors.length > 0 && /* @__PURE__ */ jsxs("div", { className: "p-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-md text-sm", children: [
            /* @__PURE__ */ jsx("p", { className: "font-semibold mb-2", children: "Erros de Validação da Planilha (Linhas Ignoradas):" }),
            /* @__PURE__ */ jsx("ul", { className: "list-disc pl-5 max-h-32 overflow-y-auto space-y-1", children: currentValidation.errors.map((e, i) => /* @__PURE__ */ jsxs("li", { children: [
              "Linha ",
              e.line,
              ": ",
              e.error
            ] }, i)) })
          ] }),
          currentData.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-4 animate-in slide-in-from-bottom-2", children: [
            /* @__PURE__ */ jsx("div", { className: "p-4 bg-blue-50 text-blue-800 rounded-md text-sm flex items-center justify-between", children: /* @__PURE__ */ jsxs("span", { children: [
              /* @__PURE__ */ jsx("span", { className: "font-bold text-lg", children: currentData.length }),
              " registros prontos para validação final e importação no banco de dados."
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "border border-gray-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [
              /* @__PURE__ */ jsx("thead", { className: "bg-gray-50 sticky top-0", children: /* @__PURE__ */ jsx("tr", { children: getPreviewHeaders(currentData).map((h) => /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: h }, h)) }) }),
              /* @__PURE__ */ jsxs("tbody", { className: "bg-white divide-y divide-gray-200 text-sm", children: [
                currentData.slice(0, 5).map((row, i) => /* @__PURE__ */ jsx("tr", { children: getPreviewHeaders(currentData).map((h) => /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-gray-900 truncate max-w-[200px]", title: row[h], children: row[h] }, h)) }, i)),
                currentData.length > 5 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsxs("td", { colSpan: getPreviewHeaders(currentData).length, className: "px-6 py-2 text-center text-xs text-gray-500 bg-gray-50/50 font-medium", children: [
                  "... mostrando 5 de ",
                  currentData.length,
                  " registros"
                ] }) })
              ] })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "flex justify-end pt-4 border-t border-gray-100", children: /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleImport,
                disabled: isProcessing,
                className: "inline-flex items-center justify-center px-6 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                children: isProcessing ? /* @__PURE__ */ jsxs("span", { className: "flex items-center", children: [
                  /* @__PURE__ */ jsxs("svg", { className: "animate-spin -ml-1 mr-2 h-4 w-4 text-white", fill: "none", viewBox: "0 0 24 24", children: [
                    /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                    /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
                  ] }),
                  "Processando Importação (",
                  currentData.length,
                  ")"
                ] }) : `Validar e Importar ${activeStepConfig.title}`
              }
            ) })
          ] })
        ] })
      ] }, activeStepConfig.id)
    ] })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Migração de Dados | Admin" }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="max-w-5xl mx-auto space-y-6"> <div> <h1 class="text-2xl font-bold text-text-primary tracking-tight">
Migração de Dados
</h1> <p class="text-sm text-text-secondary mt-1">
Importe e valide dados em lote (Cargos e Usuários) de forma
                estruturada.
</p> </div> ${renderComponent($$result2, "MigrationManager", MigrationManager, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/OneDrive/TatuTec/gerenciar/src/modules/admin/components/MigrationManager", "client:component-export": "MigrationManager" })} </div> `, "sidebar": ($$result2) => renderTemplate`${renderComponent($$result2, "AdminSidebar", $$AdminSidebar, { "slot": "sidebar" })}` })}`;
}, "D:/OneDrive/TatuTec/gerenciar/src/pages/admin/migration/index.astro", void 0);

const $$file = "D:/OneDrive/TatuTec/gerenciar/src/pages/admin/migration/index.astro";
const $$url = "/admin/migration";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
