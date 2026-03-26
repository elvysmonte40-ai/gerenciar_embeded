import { c as createComponent } from './astro-component_BtCFjQZe.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_CyO4XxjQ.mjs';
import { $ as $$AppLayout, r as renderScript } from './AppLayout_9RuWQQJO.mjs';

const $$UpdatePassword = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Definir Senha", "disableNav": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"> <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100"> <div class="text-center"> <h2 class="mt-6 text-3xl font-extrabold text-text-primary">
Definir Nova Senha
</h2> <p class="mt-2 text-sm text-text-secondary">
Por favor, defina uma senha segura para acessar sua conta.
</p> </div> <div id="message" class="hidden rounded-md p-4"></div> <form id="passwordForm" class="mt-8 space-y-6"> <div class="space-y-4"> <div> <label for="password" class="sr-only">Nova Senha</label> <input id="password" name="password" type="password" required class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-text-primary focus:outline-none focus:ring-brand focus:border-brand focus:z-10 sm:text-sm" placeholder="Nova Senha (min. 6 caracteres)" minlength="6"> </div> <div> <label for="confirmPassword" class="sr-only">Confirmar Senha</label> <input id="confirmPassword" name="confirmPassword" type="password" required class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-text-primary focus:outline-none focus:ring-brand focus:border-brand focus:z-10 sm:text-sm" placeholder="Confirmar Senha" minlength="6"> </div> </div> <div> <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-colors">
Definir Senha e Entrar
</button> </div> </form> </div> </div> ` })} ${renderScript($$result, "D:/OneDrive/TatuTec/gerenciar/src/pages/update-password.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/OneDrive/TatuTec/gerenciar/src/pages/update-password.astro", void 0);

const $$file = "D:/OneDrive/TatuTec/gerenciar/src/pages/update-password.astro";
const $$url = "/update-password";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$UpdatePassword,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
