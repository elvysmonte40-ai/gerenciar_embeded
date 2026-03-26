import { c as createComponent } from './astro-component_BtCFjQZe.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate } from './entrypoint_CyO4XxjQ.mjs';
import { $ as $$IndicatorsLayout } from './IndicatorsLayout_CMVW0PZm.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Edit, Target, ArrowUp, ArrowDown, Calendar, X, RefreshCw, Plus, Search, Filter } from 'lucide-react';
import { createPortal } from 'react-dom';
import { s as supabase } from './supabase_C4p1dVZL.mjs';
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { hasPermission, fetchUserPermissions } from './permissions_CCDHY6zh.mjs';

const IndicatorCard = ({
  indicator,
  lastEntry,
  onClick,
  canEdit = false
}) => {
  const statusConfig = {
    GREEN: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
      label: "Meta Atingida"
    },
    YELLOW: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      dot: "bg-amber-500",
      label: "Atenção"
    },
    RED: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
      dot: "bg-rose-500",
      label: "Crítico"
    }
  };
  const isAnnual = indicator.periodicity === "annual";
  const realized = isAnnual && lastEntry?.accumulated ? lastEntry.accumulated.realized : lastEntry?.realized;
  const target = isAnnual && lastEntry?.accumulated ? lastEntry.accumulated.target : lastEntry?.target;
  const performance = isAnnual && lastEntry?.accumulated ? lastEntry.accumulated.performance : lastEntry?.performance;
  const currentStatus = lastEntry ? statusConfig[lastEntry.status] : null;
  const getFormat = (val, unit) => {
    if (val === null || val === void 0) return "-";
    const decimals = indicator.decimal_places ?? 2;
    if (unit === "currency")
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals
      }).format(val);
    if (unit === "percent") return `${val.toFixed(decimals)}%`;
    return val.toLocaleString("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };
  lastEntry?.status === "GREEN" ? TrendingUp : lastEntry?.status === "RED" ? TrendingDown : Minus;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      onClick,
      className: "bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-brand-light transition-all duration-200 cursor-pointer p-5 flex flex-col gap-4 group relative overflow-hidden h-full",
      children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 w-full h-1 bg-transparent group-hover:bg-brand transition-colors" }),
        canEdit && /* @__PURE__ */ jsx("div", { className: "absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10", children: /* @__PURE__ */ jsx(
          "a",
          {
            href: `/indicators/${indicator.id}`,
            onClick: (e) => e.stopPropagation(),
            className: "p-1.5 bg-white border border-gray-200 rounded-md shadow-sm text-gray-400 hover:text-brand hover:border-brand-light flex items-center justify-center transition-colors",
            children: /* @__PURE__ */ jsx(Edit, { size: 14 })
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start pt-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1 pr-2", children: [
            /* @__PURE__ */ jsx(
              "h3",
              {
                className: "font-semibold text-text-primary text-base leading-tight group-hover:text-brand transition-colors line-clamp-2",
                title: indicator.title,
                children: indicator.title
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs text-text-secondary capitalize", children: isAnnual ? "Meta Anual" : "Meta Mensal" }),
              isAnnual && /* @__PURE__ */ jsx("span", { className: "text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 uppercase font-semibold", children: "Acumulado" })
            ] })
          ] }),
          lastEntry && currentStatus && /* @__PURE__ */ jsx(
            "span",
            {
              className: `px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusConfig[lastEntry.status].bg} ${statusConfig[lastEntry.status].text} ${statusConfig[lastEntry.status].border}`,
              children: getFormat(performance, "percent")
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-auto pt-2", children: lastEntry && currentStatus ? /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-text-secondary uppercase tracking-wider", children: "Resultado" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-xs font-medium text-text-secondary", children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: `w-2 h-2 rounded-full ${statusConfig[lastEntry.status].dot}`
                }
              ),
              statusConfig[lastEntry.status].label
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between", children: [
            /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("span", { className: "text-2xl font-bold text-text-primary tracking-tight block", children: [
              getFormat(realized, indicator.unit),
              " ",
              /* @__PURE__ */ jsx("span", { className: "text-sm font-normal text-gray-500", children: indicator.unit === "number" && "" })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 justify-end text-xs text-text-secondary mb-0.5", children: [
                /* @__PURE__ */ jsx(Target, { size: 12 }),
                /* @__PURE__ */ jsx("span", { children: "Meta" })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-text-secondary", children: getFormat(target, indicator.unit) })
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-6 bg-gray-50/50 rounded-lg border border-dashed border-gray-200 flex flex-col items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsx(Minus, { className: "text-gray-300" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-text-secondary font-medium", children: "Aguardando dados" })
        ] }) })
      ]
    }
  );
};

function calculatePerformance(realized, target, direction) {
  if (target === 0) return 0;
  if (direction === "LOWER_BETTER") {
    if (realized === 0) return 100;
    return target / realized * 100;
  }
  return realized / target * 100;
}
function getComprehensiveStatus(currentPerformance, previousEntries) {
  if (currentPerformance >= 100) return "GREEN";
  let consecutiveMisses = 1;
  for (const entry of previousEntries) {
    if (entry.performance < 100) {
      consecutiveMisses++;
    } else {
      break;
    }
  }
  if (consecutiveMisses >= 3) return "RED";
  return "YELLOW";
}
function calculateTrend(currentRealized, previousRealized) {
  if (currentRealized > previousRealized) return "UP";
  if (currentRealized < previousRealized) return "DOWN";
  return "FLAT";
}

const indicatorsService = {
  async getIndicators(organizationId) {
    const { data, error } = await supabase.from("indicators").select("*").eq("organization_id", organizationId).order("sort_order", { ascending: true }).order("title", { ascending: true });
    if (error) throw error;
    return data;
  },
  async getIndicatorsWithPerformance(organizationId) {
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    const previousYear = currentYear - 1;
    const { data, error } = await supabase.from("indicators").select(`
                *,
                indicator_entries!inner (
                    id, month, year, realized, target, budget
                )
            `).eq("organization_id", organizationId).in("indicator_entries.year", [currentYear, previousYear]).order("sort_order", { ascending: true }).order("title", { ascending: true });
    let indicatorsData = data;
    if (error || !data || data.length === 0) {
      const { data: allData, error: allErr } = await supabase.from("indicators").select(`
                  *,
                  indicator_entries (
                      id, month, year, realized, target, budget
                  )
              `).eq("organization_id", organizationId).order("sort_order", { ascending: true }).order("title", { ascending: true });
      if (allErr) throw allErr;
      indicatorsData = allData;
    }
    const indicatorsWithPerformance = (indicatorsData || []).map((ind) => {
      let entries = ind.indicator_entries || [];
      entries = entries.filter((e) => e.year === currentYear || e.year === previousYear);
      const sortedEntries = entries.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
      const lastEntry = sortedEntries[0];
      let calculatedEntry = null;
      if (lastEntry && lastEntry.realized != null && lastEntry.target != null) {
        const performance = calculatePerformance(lastEntry.realized, lastEntry.target, ind.direction);
        const status = getComprehensiveStatus(performance, []);
        const previousEntry = sortedEntries[1];
        let trend = "FLAT";
        if (previousEntry && previousEntry.realized != null) {
          trend = calculateTrend(lastEntry.realized, previousEntry.realized);
        }
        calculatedEntry = {
          ...lastEntry,
          performance,
          deviation: (lastEntry.realized || 0) - (lastEntry.target || 0),
          status,
          trend
        };
      } else if (lastEntry) {
        calculatedEntry = {
          ...lastEntry,
          performance: 0,
          deviation: 0,
          status: "YELLOW",
          // Default/Unknown
          trend: "FLAT"
        };
      }
      if (ind.periodicity === "annual" && calculatedEntry) {
        const yearToCalc = lastEntry?.year || currentYear;
        const monthToCalc = lastEntry?.month || (/* @__PURE__ */ new Date()).getMonth() + 1;
        const yearlyEntries = sortedEntries.filter((e) => e.year === yearToCalc && e.month <= monthToCalc);
        const accumulatedRealized = yearlyEntries.reduce((sum, e) => sum + (e.realized || 0), 0);
        const accumulatedTarget = yearlyEntries.reduce((sum, e) => sum + (e.target || 0), 0);
        let accumulatedPerformance = 0;
        if (accumulatedTarget !== 0) {
          accumulatedPerformance = calculatePerformance(accumulatedRealized, accumulatedTarget, ind.direction);
        }
        calculatedEntry = {
          ...calculatedEntry,
          accumulated: {
            realized: accumulatedRealized,
            target: accumulatedTarget,
            performance: accumulatedPerformance
          }
        };
      }
      return {
        ...ind,
        lastEntry: calculatedEntry
      };
    });
    return indicatorsWithPerformance;
  },
  async getIndicator(id) {
    const { data, error } = await supabase.from("indicators").select("*").eq("id", id).single();
    if (error) throw error;
    return data;
  },
  async createIndicator(indicator) {
    const { data, error } = await supabase.from("indicators").insert(indicator).select().single();
    if (error) throw error;
    return data;
  },
  async updateIndicator(id, updates) {
    const { data, error } = await supabase.from("indicators").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
  async deleteIndicator(id) {
    const { error } = await supabase.from("indicators").delete().eq("id", id);
    if (error) throw error;
  },
  async getEntries(indicatorId, year) {
    const { data, error } = await supabase.from("indicator_entries").select("*").eq("indicator_id", indicatorId).eq("year", year).order("month");
    if (error) throw error;
    return data;
  },
  async upsertEntry(entry) {
    const { data, error } = await supabase.from("indicator_entries").upsert(entry, { onConflict: "indicator_id, month, year" }).select().single();
    if (error) throw error;
    return data;
  }
};

const IndicatorForm = ({ isOpen, onClose, onSuccess, indicatorToEdit }) => {
  const [title, setTitle] = useState(indicatorToEdit?.title || "");
  const [unit, setUnit] = useState(indicatorToEdit?.unit || "number");
  const [direction, setDirection] = useState(indicatorToEdit?.direction || "HIGHER_BETTER");
  const [sortOrder, setSortOrder] = useState(indicatorToEdit?.sort_order || 0);
  const [decimalPlaces, setDecimalPlaces] = useState(indicatorToEdit?.decimal_places || 2);
  const [description, setDescription] = useState(indicatorToEdit?.description || "");
  const [calculationType, setCalculationType] = useState(indicatorToEdit?.calculation_type || "SIMPLE");
  const [periodicity, setPeriodicity] = useState(indicatorToEdit?.periodicity || "monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  React.useEffect(() => {
    if (isOpen) {
      setTitle(indicatorToEdit?.title || "");
      setUnit(indicatorToEdit?.unit || "number");
      setDirection(indicatorToEdit?.direction || "HIGHER_BETTER");
      setSortOrder(indicatorToEdit?.sort_order || 0);
      setDecimalPlaces(indicatorToEdit?.decimal_places || 2);
      setDescription(indicatorToEdit?.description || "");
      setCalculationType(indicatorToEdit?.calculation_type || "SIMPLE");
      setPeriodicity(indicatorToEdit?.periodicity || "monthly");
      setError(null);
    }
  }, [isOpen, indicatorToEdit]);
  if (!isOpen) return null;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessão expirada.");
      const orgId = session.user.user_metadata.organization_id;
      const indicatorData = {
        title,
        unit,
        direction,
        sort_order: sortOrder,
        decimal_places: decimalPlaces,
        description,
        calculation_type: calculationType,
        periodicity
      };
      if (indicatorToEdit) {
        await indicatorsService.updateIndicator(indicatorToEdit.id, indicatorData);
      } else {
        await indicatorsService.createIndicator({
          ...indicatorData,
          organization_id: orgId
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving indicator:", err);
      setError(err.message || "Erro ao salvar indicador.");
    } finally {
      setLoading(false);
    }
  };
  return createPortal(
    /* @__PURE__ */ jsxs("div", { className: "relative z-9999", "aria-labelledby": "modal-title", role: "dialog", "aria-modal": "true", children: [
      /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 transition-opacity", onClick: onClose }),
      /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-10 w-screen overflow-y-auto", children: /* @__PURE__ */ jsx("div", { className: "flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0", children: /* @__PURE__ */ jsx("div", { className: "relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl", children: /* @__PURE__ */ jsxs("div", { className: "bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold leading-6 text-gray-900", id: "modal-title", children: indicatorToEdit ? "Editar Indicador" : "Novo Indicador" }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "mt-4 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "col-span-8", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "title", className: "block text-sm font-medium text-gray-700", children: "Título do Indicador" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  id: "title",
                  required: true,
                  className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm",
                  value: title,
                  onChange: (e) => setTitle(e.target.value),
                  placeholder: "Ex: Faturamento Bruto"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "col-span-4", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "sortOrder", className: "block text-sm font-medium text-gray-700", children: "Ordenação" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  id: "sortOrder",
                  className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm",
                  value: sortOrder,
                  onChange: (e) => setSortOrder(Number(e.target.value))
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "description", className: "block text-sm font-medium text-gray-700", children: "Descrição" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                id: "description",
                maxLength: 1e3,
                rows: 3,
                className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm",
                value: description,
                onChange: (e) => setDescription(e.target.value),
                placeholder: "Descreva o objetivo deste indicador..."
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 text-right", children: [
              description.length,
              "/1000"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "unit", className: "block text-sm font-medium text-gray-700", children: "Unidade de Medida" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  id: "unit",
                  className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm bg-white",
                  value: unit,
                  onChange: (e) => setUnit(e.target.value),
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "number", children: "Número (123)" }),
                    /* @__PURE__ */ jsx("option", { value: "currency", children: "Moeda (R$)" }),
                    /* @__PURE__ */ jsx("option", { value: "percent", children: "Porcentagem (%)" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "periodicity", className: "block text-sm font-medium text-gray-700", children: "Periodicidade da Meta" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  id: "periodicity",
                  className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm bg-white",
                  value: periodicity,
                  onChange: (e) => setPeriodicity(e.target.value),
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "monthly", children: "Mensal" }),
                    /* @__PURE__ */ jsx("option", { value: "annual", children: "Anual (Acumulado)" })
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "direction", className: "block text-sm font-medium text-gray-700", children: "Direção da Meta" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  id: "direction",
                  className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm bg-white",
                  value: direction,
                  onChange: (e) => setDirection(e.target.value),
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "HIGHER_BETTER", children: "Maior é melhor (↑)" }),
                    /* @__PURE__ */ jsx("option", { value: "LOWER_BETTER", children: "Menor é melhor (↓)" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "decimalPlaces", className: "block text-sm font-medium text-gray-700", children: "Casas Decimais" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  id: "decimalPlaces",
                  min: 0,
                  max: 5,
                  className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm",
                  value: decimalPlaces,
                  onChange: (e) => setDecimalPlaces(Number(e.target.value))
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "calculationType", className: "block text-sm font-medium text-gray-700", children: "Tipo de Configuração" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                id: "calculationType",
                className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm bg-white",
                value: calculationType,
                onChange: (e) => setCalculationType(e.target.value),
                children: [
                  /* @__PURE__ */ jsx("option", { value: "SIMPLE", children: "Simples (Inserção Direta)" }),
                  /* @__PURE__ */ jsx("option", { value: "NUMERATOR_DENOMINATOR", children: "Numerador / Denominador" })
                ]
              }
            )
          ] }),
          error && /* @__PURE__ */ jsx("div", { className: "text-red-600 text-sm bg-red-50 p-2 rounded", children: error }),
          /* @__PURE__ */ jsxs("div", { className: "mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "submit",
                disabled: loading,
                className: "inline-flex w-full justify-center rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:col-start-2 disabled:opacity-50",
                children: loading ? "Salvando..." : "Salvar"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0",
                onClick: onClose,
                children: "Cancelar"
              }
            )
          ] })
        ] })
      ] }) }) }) })
    ] }),
    document.body
  );
};

const IndicatorChartModal = ({ isOpen, onClose, indicator }) => {
  const [year, setYear] = useState((/* @__PURE__ */ new Date()).getFullYear());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (isOpen && indicator) {
      fetchData();
    }
  }, [isOpen, indicator, year]);
  const fetchData = async () => {
    if (!indicator) return;
    setLoading(true);
    try {
      const entries = await indicatorsService.getEntries(indicator.id, year);
      const fullYearData = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const entry = entries.find((e) => e.month === month);
        return {
          monthName: new Date(year, i).toLocaleString("pt-BR", { month: "short" }),
          month,
          realized: entry?.realized ?? null,
          target: entry?.target ?? null,
          budget: entry?.budget ?? null
        };
      });
      setData(fullYearData);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen || !indicator) return null;
  return createPortal(
    /* @__PURE__ */ jsxs("div", { className: "relative z-9999", "aria-labelledby": "modal-title", role: "dialog", "aria-modal": "true", children: [
      /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 transition-opacity backdrop-blur-sm", onClick: onClose }),
      /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-10 w-screen overflow-y-auto", children: /* @__PURE__ */ jsx("div", { className: "flex min-h-full items-center justify-center p-4 text-center sm:p-0", children: /* @__PURE__ */ jsxs("div", { className: "relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-4xl border border-gray-100", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold leading-6 text-text-primary", id: "modal-title", children: indicator.title }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-text-secondary mt-1 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxs("span", { children: [
                "Desempenho ",
                year,
                " (",
                indicator.unit === "currency" ? "R$" : indicator.unit === "percent" ? "%" : "Unidade",
                ")"
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-gray-300", children: "|" }),
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: `flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${indicator.direction === "HIGHER_BETTER" ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-orange-50 text-orange-700 border border-orange-100"}`,
                  title: indicator.direction === "HIGHER_BETTER" ? "Quanto maior, melhor" : "Quanto menor, melhor",
                  children: indicator.direction === "HIGHER_BETTER" ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(ArrowUp, { size: 12 }),
                    "Maior é melhor"
                  ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(ArrowDown, { size: 12 }),
                    "Menor é melhor"
                  ] })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: year,
                  onChange: (e) => setYear(Number(e.target.value)),
                  className: "appearance-none bg-white border border-gray-300 text-text-secondary py-1.5 pl-3 pr-8 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand cursor-pointer",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: 2024, children: "2024" }),
                    /* @__PURE__ */ jsx("option", { value: 2025, children: "2025" }),
                    /* @__PURE__ */ jsx("option", { value: 2026, children: "2026" })
                  ]
                }
              ),
              /* @__PURE__ */ jsx(Calendar, { size: 14, className: "absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" })
            ] }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                className: "rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none",
                onClick: onClose,
                children: [
                  /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Fechar" }),
                  /* @__PURE__ */ jsx(X, { size: 20 })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "px-6 py-6 bg-white min-h-[400px]", children: loading ? /* @__PURE__ */ jsx("div", { className: "h-[350px] flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-brand" }) }) : /* @__PURE__ */ jsx("div", { className: "h-[350px] w-full", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(
          ComposedChart,
          {
            data,
            margin: {
              top: 20,
              right: 20,
              bottom: 20,
              left: 20
            },
            children: [
              /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "#E1DFDD" }),
              /* @__PURE__ */ jsx(
                XAxis,
                {
                  dataKey: "monthName",
                  axisLine: false,
                  tickLine: false,
                  tick: { fill: "#605E5C", fontSize: 12 },
                  dy: 10
                }
              ),
              /* @__PURE__ */ jsx(
                YAxis,
                {
                  axisLine: false,
                  tickLine: false,
                  tick: { fill: "#605E5C", fontSize: 12 },
                  tickFormatter: (value) => {
                    if (value >= 1e3) return `${(value / 1e3).toFixed(0)}k`;
                    return value;
                  },
                  domain: ["auto", "auto"]
                }
              ),
              /* @__PURE__ */ jsx(
                Tooltip,
                {
                  contentStyle: {
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E1DFDD",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  },
                  itemStyle: { fontSize: "13px", fontWeight: 500 },
                  labelStyle: { color: "#605E5C", marginBottom: "8px", fontSize: "12px" },
                  formatter: (value, name) => {
                    const val = Number(value);
                    const decimals = indicator.decimal_places ?? 2;
                    const formatted = indicator.unit === "currency" ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(val) : indicator.unit === "percent" ? `${val.toFixed(decimals)}%` : val.toLocaleString("pt-BR", { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
                    const nameMap = { realized: "Realizado", target: "Meta", budget: "Orçamento" };
                    return [formatted, nameMap[String(name)] || name];
                  }
                }
              ),
              /* @__PURE__ */ jsx(
                Legend,
                {
                  verticalAlign: "top",
                  height: 36,
                  formatter: (value) => {
                    const map = { realized: "Realizado", target: "Meta", budget: "Orçamento" };
                    return /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-text-secondary ml-1", children: map[value] });
                  }
                }
              ),
              /* @__PURE__ */ jsx(
                Line,
                {
                  type: "monotone",
                  dataKey: "budget",
                  stroke: "#605E5C",
                  strokeDasharray: "3 3",
                  strokeWidth: 2,
                  dot: false,
                  name: "budget",
                  activeDot: { r: 6 }
                }
              ),
              /* @__PURE__ */ jsx(
                Line,
                {
                  type: "monotone",
                  dataKey: "target",
                  stroke: "#0078D4",
                  strokeDasharray: "5 5",
                  strokeWidth: 2,
                  dot: { r: 4, strokeWidth: 0, fill: "#0078D4" },
                  name: "target",
                  activeDot: { r: 6 }
                }
              ),
              /* @__PURE__ */ jsx(
                Line,
                {
                  type: "monotone",
                  dataKey: "realized",
                  stroke: "#201F1E",
                  strokeWidth: 3,
                  dot: { r: 5, strokeWidth: 2, fill: "#FFFFFF", stroke: "#201F1E" },
                  name: "realized",
                  activeDot: { r: 7, strokeWidth: 0, fill: "#201F1E" }
                }
              )
            ]
          }
        ) }) }) })
      ] }) }) })
    ] }),
    document.body
  );
};

const IndicatorsList = () => {
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const fetchIndicators = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.user_metadata?.organization_id) {
        const perms = await fetchUserPermissions(session.user.id);
        setPermissions(perms.permissions);
        setIsOrgAdmin(perms.isOrgAdmin);
        const data = await indicatorsService.getIndicatorsWithPerformance(session.user.user_metadata.organization_id);
        setIndicators(data);
      }
    } catch (error) {
      console.error("Error fetching indicators:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchIndicators();
  }, []);
  const filteredIndicators = indicators.filter(
    (ind) => ind.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const canCreate = hasPermission(permissions, "indicators", "create", isOrgAdmin);
  const canEdit = hasPermission(permissions, "indicators", "edit", isOrgAdmin);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsx("div", { className: "flex flex-col md:flex-row md:items-center justify-end gap-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: fetchIndicators,
          className: "text-text-secondary hover:text-brand p-2 rounded-md hover:bg-gray-100 transition-colors",
          title: "Atualizar",
          children: /* @__PURE__ */ jsx(RefreshCw, { size: 18, className: loading ? "animate-spin" : "" })
        }
      ),
      canCreate && /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setIsFormOpen(true),
          className: "bg-brand text-white text-sm px-4 py-2.5 rounded-lg hover:bg-brand-dark flex items-center gap-2 font-semibold shadow-sm hover:shadow transition-all",
          children: [
            /* @__PURE__ */ jsx(Plus, { size: 18 }),
            "Novo Indicador"
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400", size: 18 }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Buscar indicador...",
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
            className: "w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-brand transition-all"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("button", { className: "flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-text-secondary hover:bg-gray-50 hover:text-text-primary transition-colors", children: [
        /* @__PURE__ */ jsx(Filter, { size: 18 }),
        "Filtros"
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsx("div", { className: "py-12 flex justify-center", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-brand" }) }) : filteredIndicators.length > 0 ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", children: filteredIndicators.map((ind) => /* @__PURE__ */ jsx(
      IndicatorCard,
      {
        indicator: ind,
        lastEntry: ind.lastEntry,
        onClick: () => setSelectedIndicator(ind),
        canEdit
      },
      ind.id
    )) }) : /* @__PURE__ */ jsx("div", { className: "text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200", children: searchTerm ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("p", { className: "text-text-secondary", children: [
        'Nenhum indicador encontrado para "',
        searchTerm,
        '".'
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setSearchTerm(""),
          className: "text-brand text-sm font-medium hover:underline mt-2",
          children: "Limpar busca"
        }
      )
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("p", { className: "text-text-secondary", children: "Você ainda não criou nenhum indicador." }),
      canCreate && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setIsFormOpen(true),
          className: "text-brand text-sm font-medium hover:underline mt-2",
          children: "Criar meu primeiro indicador"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx(
      IndicatorForm,
      {
        isOpen: isFormOpen,
        onClose: () => setIsFormOpen(false),
        onSuccess: fetchIndicators
      }
    ),
    /* @__PURE__ */ jsx(
      IndicatorChartModal,
      {
        isOpen: !!selectedIndicator,
        onClose: () => setSelectedIndicator(null),
        indicator: selectedIndicator
      }
    )
  ] });
};

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "IndicatorsLayout", $$IndicatorsLayout, { "title": "Indicadores" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "IndicatorsList", IndicatorsList, { "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/OneDrive/TatuTec/gerenciar/src/modules/indicators/pages/IndicatorsList", "client:component-export": "IndicatorsList" })} ` })}`;
}, "D:/OneDrive/TatuTec/gerenciar/src/pages/indicators/index.astro", void 0);

const $$file = "D:/OneDrive/TatuTec/gerenciar/src/pages/indicators/index.astro";
const $$url = "/indicators";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
