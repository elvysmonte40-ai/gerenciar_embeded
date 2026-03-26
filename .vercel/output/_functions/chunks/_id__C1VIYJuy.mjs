import { c as createComponent } from './astro-component_BtCFjQZe.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate } from './entrypoint_CyO4XxjQ.mjs';
import { $ as $$IndicatorsLayout } from './IndicatorsLayout_CMVW0PZm.mjs';

const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  return renderTemplate`${renderComponent($$result, "IndicatorsLayout", $$IndicatorsLayout, { "title": "Detalhes do Indicador" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "IndicatorDetails", null, { "indicatorId": id, "client:only": "react", "client:component-hydration": "only", "client:component-path": "D:/OneDrive/TatuTec/gerenciar/src/modules/indicators/pages/IndicatorDetails", "client:component-export": "IndicatorDetails" })} ` })}`;
}, "D:/OneDrive/TatuTec/gerenciar/src/pages/indicators/[id].astro", void 0);

const $$file = "D:/OneDrive/TatuTec/gerenciar/src/pages/indicators/[id].astro";
const $$url = "/indicators/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$id,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
