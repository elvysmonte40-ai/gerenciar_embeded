
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugSync() {
    const cpf = '06332593300'; // Ana Luiza
    console.log(`--- INICIANDO DIAGNÓSTICO: ANA LUIZA (CPF: ${cpf}) ---`);

    // 1. Pegar Perfil
    const { data: profile } = await supabase.from('profiles').select('*').eq('cpf', cpf).single();
    if (!profile) return console.error("Perfil não encontrado no Supabase!");
    console.log(`Email no Profile atual: ${profile.email}`);

    // 2. Pegar Auth User
    const { data: { users }, error: authErr } = await supabase.auth.admin.listUsers();
    const authUser = users.find(u => u.id === profile.id);
    console.log(`Email no Supabase Auth: ${authUser?.email}`);

    // 3. Pegar Data no Staging (Voors)
    const { data: staging } = await supabase.from('voors_users_staging').select('payload').order('created_at', { ascending: false }).limit(1).single();
    const voorsData = staging.payload.find(u => u.CPF?.replace(/\D/g, '') === cpf);
    
    if (!voorsData) return console.error("Dados da Ana Luiza não encontrados no payload do Voors!");
    console.log(`Email vindo do Voors: ${voorsData.email}`);

    // 4. Testar Lógica de Comparação
    const currentEmail = authUser?.email?.toLowerCase().trim();
    const newVoorsEmail = voorsData.email?.toLowerCase().trim();

    console.log(`\nComparação de Email:`);
    console.log(`Atual (Auth): "${currentEmail}"`);
    console.log(`Novo (Voors): "${newVoorsEmail}"`);
    console.log(`Diferentes? ${currentEmail !== newVoorsEmail}`);

    if (currentEmail !== newVoorsEmail) {
        console.log(`\n>>> TENTANDO ATUALIZAR AUTH AGORA...`);
        const { error: upErr } = await supabase.auth.admin.updateUserById(profile.id, {
            email: newVoorsEmail,
            email_confirm: true
        });
        if (upErr) console.error("Erro no Update do Auth:", upErr.message);
        else console.log("SUCESSO: Email no Auth atualizado.");
        
        console.log(`\n>>> TENTANDO ATUALIZAR PROFILE AGORA...`);
        const { error: prErr } = await supabase.from('profiles').update({ email: newVoorsEmail }).eq('id', profile.id);
        if (prErr) console.error("Erro no Update do Profile:", prErr.message);
        else console.log("SUCESSO: Email no Profile atualizado.");
    } else {
        console.log("\nO sistema ignorou a atualização porque os emails foram considerados IGUAIS.");
    }
}

debugSync();
