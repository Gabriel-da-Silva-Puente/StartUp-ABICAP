const activities = [

    {
        id: 1,
        title: "Semana da Ciência — trazer material reciclável",
        description:
            "Para a feira de ciências da próxima semana, cada aluno deve trazer pelo menos 2 itens recicláveis (garrafas PET, caixas ou tampinhas). Serão usados para montar os experimentos em sala.",
        deadline: "26/09/2026",
        date: "19/09/2026",
        reads: 14,
        total: 22,
        status: "aberta"
    },

    {
        id: 2,
        title: "Leitura em casa — escolher livro favorito",
        description:
            "Peçam que a criança escolha seu livro favorito e leia em casa esta semana. Na sexta faremos uma roda de conversa onde cada um vai contar a história para os colegas.",
        deadline: "25/09/2026",
        date: "19/09/2026",
        reads: 9,
        total: 22,
        status: "aberta"
    },

    {
        id: 3,
        title: "Atividade de Artes — levar avental",
        description:
            "Na próxima aula vamos pintar com tinta guache. Peçam que o aluno traga um avental ou roupa velha.",
        deadline: "07/09/2026",
        date: "07/09/2026",
        reads: 21,
        total: 22,
        status: "encerrada"
    },

    {
        id: 4,
        title: "Projeto Meio Ambiente — coletar tampinhas",
        description:
            "Para o projeto de reciclagem pedimos que cada aluno traga 10 tampinhas de garrafa PET até sexta-feira.",
        deadline: "05/09/2026",
        date: "03/09/2026",
        reads: 22,
        total: 22,
        status: "encerrada"
    },

    {
        id: 5,
        title: "Avaliação diagnóstica — leitura e escrita",
        description:
            "Na semana que vem teremos atividade de sondagem de leitura e escrita. Não é necessário estudar, apenas garantir que a criança venha descansada.",
        deadline: "15/05/2026",
        date: "15/05/2026",
        reads: 20,
        total: 22,
        status: "encerrada"
    }

];


/* =========================================
   ELEMENTOS
========================================= */

const activityList =
    document.getElementById("activity-list");

const searchInput =
    document.getElementById(
        "input-busca-atividade"
    );

const statusSelect =
    document.getElementById(
        "select-status-atividade"
    );

const modalNewActivity =
    document.getElementById(
        "modal-nova-atividade"
    );

const modalDetailActivity =
    document.getElementById(
        "modal-detalhes-atividade"
    );

const formNewActivity =
    document.getElementById(
        "form-nova-atividade"
    );

const toast =
    document.getElementById("toast");


/* =========================================
   NAVEGAÇÃO
========================================= */

function setupNavigation() {

    const btnInicio =
        document.getElementById(
            "btn-nav-inicio"
        );

    const btnAtividades =
        document.getElementById(
            "btn-nav-atividades"
        );

    const btnAvisos =
        document.getElementById(
            "btn-nav-avisos"
        );

    const btnOcorrencias =
        document.getElementById(
            "btn-nav-ocorrencias"
        );

    const btnAutorizacoes =
        document.getElementById(
            "btn-nav-autorizacoes"
        );

    const btnMural =
        document.getElementById(
            "btn-nav-mural"
        );

    const btnPerfil =
        document.getElementById(
            "btn-nav-perfil"
        );

    const btnSair =
        document.getElementById(
            "btn-nav-sair"
        );


    if (btnInicio) {

        btnInicio.addEventListener(
            "click",
            () => {

                window.location.href =
                    "pglinicial.html";

            }
        );

    }


    if (btnAtividades) {

        btnAtividades.addEventListener(
            "click",
            () => {

                window.location.href =
                    "atividades.html";

            }
        );

    }


    if (btnAvisos) {

        btnAvisos.addEventListener(
            "click",
            () => {

                window.location.href =
                    "avisos.html";

            }
        );

    }


    if (btnOcorrencias) {

        btnOcorrencias.addEventListener(
            "click",
            () => {

                showToast(
                    "Ocorrências ainda está em desenvolvimento."
                );

            }
        );

    }


    if (btnAutorizacoes) {

        btnAutorizacoes.addEventListener(
            "click",
            () => {

                showToast(
                    "Autorizações ainda está em desenvolvimento."
                );

            }
        );

    }


    if (btnMural) {

        btnMural.addEventListener(
            "click",
            () => {

                showToast(
                    "Mural da Turma ainda está em desenvolvimento."
                );

            }
        );

    }


    if (btnPerfil) {

        btnPerfil.addEventListener(
            "click",
            () => {

                showToast(
                    "Perfil ainda está em desenvolvimento."
                );

            }
        );

    }


    if (btnSair) {

        btnSair.addEventListener(
            "click",
            () => {

                const sair =
                    confirm(
                        "Deseja realmente sair?"
                    );

                if (sair) {

                    window.location.href =
                        "pglinicial.html";

                }

            }
        );

    }

}


/* =========================================
   TURMAS
========================================= */

const btnClassSelector =
    document.getElementById(
        "btn-class-selector"
    );

const classMenu =
    document.getElementById(
        "class-menu"
    );

const classLabel =
    document.getElementById(
        "class-label"
    );


if (btnClassSelector && classMenu) {

    btnClassSelector.addEventListener(
        "click",
        () => {

            classMenu.hidden =
                !classMenu.hidden;

        }
    );

}


document
    .querySelectorAll(
        "#class-menu button"
    )
    .forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                classLabel.textContent =
                    button.dataset.class;

                classMenu.hidden =
                    true;

            }
        );

    });


/* =========================================
   RENDER
========================================= */

function renderActivities() {

    if (!activityList) {
        return;
    }


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const selectedStatus =
        statusSelect
            ? statusSelect.value
            : "todos";


    const filtered =
        activities.filter(
            (activity) => {

                const matchesSearch =
                    activity.title
                        .toLowerCase()
                        .includes(search) ||

                    activity.description
                        .toLowerCase()
                        .includes(search);


                const matchesStatus =
                    selectedStatus === "todos" ||
                    activity.status === selectedStatus;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    if (filtered.length === 0) {

        activityList.innerHTML = `
            <div class="activity-empty">
                Nenhuma atividade encontrada.
            </div>
        `;

        return;
    }


    activityList.innerHTML =
        filtered
            .map(
                (activity) => {

                    const expired =
                        activity.status ===
                        "encerrada";

                    const confirmed =
                        activity.reads ===
                        activity.total;


                    return `

                        <article
                            class="activity-card"
                            data-activity-id="${activity.id}"
                        >

                            <div class="activity-main">

                                <div class="activity-tags">

                                    <span class="tag tag-activity">
                                        Atividade
                                    </span>

                                    ${
                                        expired
                                            ? `
                                                <span class="tag tag-expired">
                                                    ⚠ Prazo encerrado
                                                </span>
                                            `
                                            : `
                                                <span class="activity-date">
                                                    Prazo: ${activity.deadline}
                                                </span>
                                            `
                                    }

                                </div>


                                <h3 class="activity-title">
                                    ${activity.title}
                                </h3>


                                <p class="activity-description">
                                    ${activity.description}
                                </p>


                                <time class="activity-date">
                                    ${activity.date}
                                </time>

                            </div>


                            <div
                                class="
                                    activity-meta
                                    ${confirmed ? "confirmed" : ""}
                                "
                            >

                                <strong>
                                    ${confirmed ? "✓" : "◷"}
                                    ${activity.reads}/${activity.total}
                                </strong>

                                <span>
                                    leituras
                                </span>

                                <div class="activity-arrow">
                                    ›
                                </div>

                            </div>

                        </article>
                    `;

                }
            )
            .join("");


    document
        .querySelectorAll(
            ".activity-card"
        )
        .forEach(
            (card) => {

                card.addEventListener(
                    "click",
                    () => {

                        openActivityDetails(
                            Number(
                                card.dataset
                                    .activityId
                            )
                        );

                    }
                );

            }
        );

}


/* =========================================
   DETALHES
========================================= */

function openActivityDetails(id) {

    const activity =
        activities.find(
            (item) =>
                item.id === id
        );


    if (!activity) {
        return;
    }


    const content =
        document.getElementById(
            "activity-detail-content"
        );


    content.innerHTML = `

        <h2>
            ${activity.title}
        </h2>

        <p>
            ${activity.description}
        </p>

        <br>

        <p>
            <strong>Publicado em:</strong>
            ${activity.date}
        </p>

        <p>
            <strong>Prazo:</strong>
            ${activity.deadline}
        </p>

        <p>
            <strong>Leituras:</strong>
            ${activity.reads}/${activity.total}
        </p>

    `;


    modalDetailActivity.hidden =
        false;

}


/* =========================================
   NOVA ATIVIDADE
========================================= */

if (formNewActivity) {

    formNewActivity.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            const title =
                document.getElementById(
                    "input-titulo-atividade"
                ).value.trim();


            const description =
                document.getElementById(
                    "input-descricao-atividade"
                ).value.trim();


            const deadline =
                document.getElementById(
                    "input-prazo-atividade"
                ).value;


            if (
                !title ||
                !description ||
                !deadline
            ) {

                return;

            }


            const date =
                new Date()
                    .toLocaleDateString(
                        "pt-BR"
                    );


            const formattedDeadline =
                deadline
                    .split("-")
                    .reverse()
                    .join("/");


            activities.unshift({

                id: Date.now(),

                title,

                description,

                deadline:
                    formattedDeadline,

                date,

                reads: 0,

                total: 22,

                status: "aberta"

            });


            formNewActivity.reset();


            modalNewActivity.hidden =
                true;


            renderActivities();

            updateStatistics();


            showToast(
                "Atividade criada com sucesso!"
            );

        }
    );

}


/* =========================================
   ESTATÍSTICAS
========================================= */

function updateStatistics() {

    const total =
        document.getElementById(
            "stat-total"
        );

    const pending =
        document.getElementById(
            "stat-pending"
        );

    const confirmed =
        document.getElementById(
            "stat-confirmed"
        );

    const count =
        document.getElementById(
            "activity-count"
        );


    if (total) {

        total.textContent =
            activities.length;

    }


    if (count) {

        count.textContent =
            activities.length;

    }


    if (pending) {

        pending.textContent =
            activities.filter(
                (item) =>
                    item.reads <
                    item.total
            ).length;

    }


    if (confirmed) {

        confirmed.textContent =
            activities.filter(
                (item) =>
                    item.reads ===
                    item.total
            ).length;

    }

}


/* =========================================
   FECHAMENTO DOS MODAIS
========================================= */

document
    .getElementById(
        "btn-fechar-nova-atividade"
    )
    ?.addEventListener(
        "click",
        () => {

            modalNewActivity.hidden =
                true;

        }
    );


document
    .getElementById(
        "btn-cancelar-atividade"
    )
    ?.addEventListener(
        "click",
        () => {

            modalNewActivity.hidden =
                true;

        }
    );


document
    .getElementById(
        "btn-fechar-detalhes-atividade"
    )
    ?.addEventListener(
        "click",
        () => {

            modalDetailActivity.hidden =
                true;

        }
    );


document
    .getElementById(
        "btn-fechar-detalhes"
    )
    ?.addEventListener(
        "click",
        () => {

            modalDetailActivity.hidden =
                true;

        }
    );


/* =========================================
   CLIQUE FORA
========================================= */

modalNewActivity?.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            modalNewActivity
        ) {

            modalNewActivity.hidden =
                true;

        }

    }
);


modalDetailActivity?.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            modalDetailActivity
        ) {

            modalDetailActivity.hidden =
                true;

        }

    }
);


/* =========================================
   ESC
========================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape") {

            if (modalNewActivity) {

                modalNewActivity.hidden =
                    true;

            }

            if (modalDetailActivity) {

                modalDetailActivity.hidden =
                    true;

            }

        }

    }
);


/* =========================================
   BUSCA
========================================= */

searchInput?.addEventListener(
    "input",
    renderActivities
);


statusSelect?.addEventListener(
    "change",
    renderActivities
);


/* =========================================
   TOAST
========================================= */

function showToast(message) {

    if (!toast) {
        return;
    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );

}


/* =========================================
   INICIALIZAÇÃO
========================================= */

setupNavigation();

renderActivities();

updateStatistics();