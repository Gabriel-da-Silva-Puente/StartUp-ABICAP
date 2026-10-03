/* PonteEscola - JavaScript compartilhado */

(function () {

    const toast = document.getElementById("toast");

    window.showToast = function (message) {

        if (!toast) return;

        toast.textContent = message;

        toast.classList.add("show");

        clearTimeout(window.__toastTimer);

        window.__toastTimer = setTimeout(function () {

            toast.classList.remove("show");

        }, 2400);
    };


    /* =========================
       PERFIL
    ========================= */

    const profileBtn = document.getElementById("profileBtn");

    if (profileBtn) {

        profileBtn.addEventListener("click", function () {

            window.showToast(
                "Perfil da professora Ana Carolina Mendes."
            );

        });

    }


    /* =========================
       SAIR
    ========================= */

    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener("click", function () {

            window.showToast("Sessão encerrada.");

        });

    }


    /* =========================
       AVISOS
    ========================= */

    const noticeKey = "ponteEscolaAvisos";

    const defaultNotices = [

        {
            id: "1",
            title: "Reunião de Pais — 20/09",
            type: "Aviso",
            message:
                "Convocamos todos os responsáveis para a reunião de pais na próxima sexta-feira, às 18h.",
            date: "10/09/2026",
            confirmations: "19/22"
        },

        {
            id: "2",
            title: "Lista de material atualizada",
            type: "Comunicado",
            message:
                "A lista de material escolar foi atualizada. Acesse o documento completo para conferir as alterações.",
            date: "09/09/2026",
            confirmations: "22/22"
        },

        {
            id: "3",
            title: "Passeio ao Zoológico — autorização pendente",
            type: "Autorização",
            message:
                "Precisamos da autorização dos responsáveis para o passeio do dia 25/09.",
            date: "08/09/2026",
            confirmations: "14/22",
            urgent: true
        }

    ];


    window.getAvisos = function () {

        try {

            const saved =
                JSON.parse(
                    localStorage.getItem(noticeKey)
                );

            if (Array.isArray(saved)) {

                return saved;

            }

        } catch (error) {

            console.log(
                "Erro ao carregar avisos:",
                error
            );

        }


        localStorage.setItem(
            noticeKey,
            JSON.stringify(defaultNotices)
        );

        return defaultNotices;

    };


    window.saveAvisos = function (items) {

        localStorage.setItem(
            noticeKey,
            JSON.stringify(items)
        );

    };


    /* =========================
       HOME
    ========================= */

    const homeList =
        document.getElementById(
            "homeNoticeList"
        );

    const statAvisos =
        document.getElementById(
            "statAvisos"
        );


    if (homeList) {

        const items = window.getAvisos();


        if (statAvisos) {

            statAvisos.textContent =
                items.length;

        }


        if (items.length === 0) {

            homeList.innerHTML = `
                <div class="empty-state">
                    Nenhum aviso cadastrado.
                </div>
            `;

        } else {

            homeList.innerHTML =
                items
                    .slice(0, 4)
                    .map(function (item) {

                        return `
                            <a
                                class="notice-preview"
                                href="./pages/avisos.html"
                            >

                                <span
                                    class="notice-dot"
                                ></span>

                                <span>

                                    <strong>
                                        ${escapeHtml(item.title)}
                                    </strong>

                                    <small>
                                        ${escapeHtml(item.type)}
                                        ·
                                        ${escapeHtml(item.date)}
                                    </small>

                                </span>

                            </a>
                        `;

                    })
                    .join("");

        }

    }


    /* =========================
       SEGURANÇA
    ========================= */

    function escapeHtml(value) {

        return String(value ?? "")
            .replace(
                /[&<>"']/g,
                function (character) {

                    return {
                        "&": "&amp;",
                        "<": "&lt;",
                        ">": "&gt;",
                        '"': "&quot;",
                        "'": "&#039;"
                    }[character];

                }
            );

    }


    window.escapeHtml = escapeHtml;


})();