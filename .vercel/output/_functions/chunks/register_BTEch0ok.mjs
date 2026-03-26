import { c as createComponent } from './astro-component_BtCFjQZe.mjs';
import 'piccolore';
import { r as renderTemplate, l as renderComponent, m as maybeRenderHead } from './entrypoint_CyO4XxjQ.mjs';
import { $ as $$AppLayout } from './AppLayout_9RuWQQJO.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Register = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate(_a || (_a = __template(["", ` <script>
    const form = document.getElementById("registerForm");
    const errorDiv = document.getElementById("formError");
    const errorMessage = document.getElementById("errorMessage");

    // Pre-fill email from URL
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get("email");
    if (emailParam) {
        const emailInput = document.getElementById("email-address");
        if (emailInput) {
            emailInput.value = emailParam;
        }
    }

    form?.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Hide error
        if (errorDiv) errorDiv.classList.add("hidden");

        const formData = new FormData(form);
        const button = form.querySelector('button[type="submit"]');
        if (button) {
            button.innerHTML = "Criando conta...";
            button.disabled = true;
        }

        try {
            const response = await fetch(form.action, {
                method: "POST",
                body: formData,
            });

            if (response.redirected) {
                window.location.href = response.url;
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                if (errorDiv && errorMessage) {
                    errorMessage.textContent =
                        data.error || "Erro ao criar conta";
                    errorDiv.classList.remove("hidden");
                } else {
                    alert(data.error || "Erro ao criar conta");
                }

                if (button) {
                    button.innerHTML = "Criar Conta";
                    button.disabled = false;
                }
            } else {
                // Fallback se não redirecionar
                window.location.href = "/dashboard?welcome=true";
            }
        } catch (error) {
            console.error(error);
            if (errorDiv && errorMessage) {
                errorMessage.textContent = "Erro de conexão. Tente novamente.";
                errorDiv.classList.remove("hidden");
            } else {
                alert("Erro de conexão. Tente novamente.");
            }
            if (button) {
                button.innerHTML = "Criar Conta";
                button.disabled = false;
            }
        }
    });
<\/script>`])), renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Criar Conta Empresarial", "disableNav": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"> <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100"> <div class="text-center"> <h2 class="mt-6 text-3xl font-extrabold text-text-primary">
Crie sua conta
</h2> <p class="mt-2 text-sm text-text-secondary">
Comece a transformar a gestão da sua empresa hoje.
</p> </div> <div id="formError" class="hidden rounded-md bg-red-50 p-4"> <div class="flex"> <div class="flex-shrink-0"> <!-- Icon --> <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path> </svg> </div> <div class="ml-3"> <h3 class="text-sm font-medium text-red-800" id="errorMessage"></h3> </div> </div> </div> <form class="mt-8 space-y-6" action="/api/auth/register" method="POST" id="registerForm"> <div class="space-y-4"> <div class="border-b border-gray-200 pb-4 mb-4"> <h3 class="text-lg font-medium text-text-primary mb-4">
Dados da Empresa
</h3> <div class="space-y-4"> <div> <label for="companyName" class="sr-only">Nome da Empresa</label> <input id="companyName" name="companyName" type="text" required class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-text-primary focus:outline-none focus:ring-brand focus:border-brand focus:z-10 sm:text-sm" placeholder="Nome da Empresa"> </div> <div> <label for="cnpj" class="sr-only">CNPJ</label> <input id="cnpj" name="cnpj" type="text" class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-text-primary focus:outline-none focus:ring-brand focus:border-brand focus:z-10 sm:text-sm" placeholder="CNPJ (Opcional)"> </div> <div> <label for="segment" class="sr-only">Segmento</label> <select id="segment" name="segment" class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-text-primary focus:outline-none focus:ring-brand focus:border-brand focus:z-10 sm:text-sm"> <option value="" disabled selected>Selecione o Segmento</option> <option value="varejo">Varejo</option> <option value="servicos">Serviços</option> <option value="industria">Indústria</option> <option value="tecnologia">Tecnologia</option> <option value="outro">Outro</option> </select> </div> </div> </div> <div> <h3 class="text-lg font-medium text-text-primary mb-4">
Dados do Administrador
</h3> <div class="space-y-4"> <div> <label for="fullName" class="sr-only">Nome Completo</label> <input id="fullName" name="fullName" type="text" required class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-text-primary focus:outline-none focus:ring-brand focus:border-brand focus:z-10 sm:text-sm" placeholder="Seu Nome Completo"> </div> <div> <label for="email-address" class="sr-only">Email corporativo</label> <input id="email-address" name="email" type="email" autocomplete="email" required class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-text-primary focus:outline-none focus:ring-brand focus:border-brand focus:z-10 sm:text-sm" placeholder="Email corporativo"> </div> <div> <label for="password" class="sr-only">Senha</label> <input id="password" name="password" type="password" autocomplete="new-password" required class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-text-primary focus:outline-none focus:ring-brand focus:border-brand focus:z-10 sm:text-sm" placeholder="Senha"> </div> </div> </div> </div> <div> <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-colors"> <span class="absolute left-0 inset-y-0 flex items-center pl-3"> <svg class="h-5 w-5 text-brand-light group-hover:text-amber-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"> <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path> </svg> </span>
Criar Conta
</button> </div> </form> </div> </div> ` }));
}, "D:/OneDrive/TatuTec/gerenciar/src/pages/register.astro", void 0);

const $$file = "D:/OneDrive/TatuTec/gerenciar/src/pages/register.astro";
const $$url = "/register";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Register,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
