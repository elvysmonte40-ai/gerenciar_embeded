import { c as createComponent } from './astro-component_BtCFjQZe.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_CyO4XxjQ.mjs';
import { $ as $$AppLayout, r as renderScript } from './AppLayout_9RuWQQJO.mjs';

const $$ForgotPassword = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Esqueci Minha Senha", "disableNav": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"> <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100"> <div class="text-center"> <div class="flex justify-center mb-4"> <span class="text-4xl">🔐</span> </div> <h2 class="mt-2 text-3xl font-extrabold text-text-primary">
Esqueceu sua senha?
</h2> <p class="mt-2 text-sm text-text-secondary">
Sem problemas! Informe seu email e enviaremos um link para redefinir sua senha.
</p> </div> <div id="message" class="hidden rounded-md p-4"></div> <form class="mt-8 space-y-6" id="forgotForm"> <div> <label for="email" class="sr-only">Email</label> <input id="email" name="email" type="email" autocomplete="email" required class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-text-primary focus:outline-none focus:ring-brand focus:border-brand focus:z-10 sm:text-sm" placeholder="Seu email corporativo"> </div> <div> <button type="submit" id="submitBtn" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-colors"> <span class="absolute left-0 inset-y-0 flex items-center pl-3"> <svg class="h-5 w-5 text-brand-light group-hover:text-amber-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"> <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path> <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path> </svg> </span>
Enviar link de redefinição
</button> </div> </form> <div class="text-center mt-4"> <p class="text-sm text-text-secondary">
Lembrou a senha?
<a href="/login" class="font-medium text-brand hover:text-brand-dark">
Voltar para o login
</a> </p> </div> </div> </div> ` })} ${renderScript($$result, "D:/OneDrive/TatuTec/gerenciar/src/pages/forgot-password.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/OneDrive/TatuTec/gerenciar/src/pages/forgot-password.astro", void 0);

const $$file = "D:/OneDrive/TatuTec/gerenciar/src/pages/forgot-password.astro";
const $$url = "/forgot-password";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$ForgotPassword,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
