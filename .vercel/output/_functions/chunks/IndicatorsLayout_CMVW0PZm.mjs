import { c as createComponent } from './astro-component_BtCFjQZe.mjs';
import 'piccolore';
import { m as maybeRenderHead, r as renderTemplate, l as renderComponent, p as renderSlot } from './entrypoint_CyO4XxjQ.mjs';
import { $ as $$AppLayout } from './AppLayout_9RuWQQJO.mjs';
import 'clsx';

const $$IndicatorsSidebar = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div slot="sidebar" class="space-y-1"> <a href="/indicators" class="block px-3 py-2 text-sm font-medium text-text-primary hover:bg-gray-100 rounded-md transition-colors">
Meus Indicadores
</a> </div>`;
}, "D:/OneDrive/TatuTec/gerenciar/src/modules/indicators/components/IndicatorsSidebar.astro", void 0);

const $$IndicatorsLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$IndicatorsLayout;
  const { title } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": title }, { "default": ($$result2) => renderTemplate`  ${renderSlot($$result2, $$slots["default"])} `, "sidebar": ($$result2) => renderTemplate`${renderComponent($$result2, "IndicatorsSidebar", $$IndicatorsSidebar, { "slot": "sidebar" })}` })}`;
}, "D:/OneDrive/TatuTec/gerenciar/src/modules/indicators/layouts/IndicatorsLayout.astro", void 0);

export { $$IndicatorsLayout as $ };
