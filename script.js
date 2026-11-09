"use strict";

const questions = [
  {
    question: "Qual destas informações é um dado pessoal sensível segundo a LGPD?",
    options: [
      "O horário de funcionamento de uma loja.",
      "O resultado de um exame médico de uma pessoa identificada.",
      "O preço de um produto anunciado por uma loja.",
    ],
    correctIndex: 1,
    explanation: "O resultado do exame revela informações sobre a saúde de uma pessoa identificada. A LGPD classifica essas informações como dados pessoais sensíveis.",
  },
  {
    question: "Uma loja mantém seu endereço antigo no cadastro. O que você pode solicitar com base na LGPD?",
    options: [
      "A lista de endereços dos outros clientes.",
      "A alteração dos cadastros de todos os clientes.",
      "A correção do seu endereço no cadastro.",
    ],
    correctIndex: 2,
    explanation: "Você pode solicitar ao responsável pelo tratamento a correção dos seus dados quando estiverem incompletos, incorretos ou desatualizados.",
  },
  {
    question: "Uma mensagem diz que sua conta será bloqueada e pede que você abra um link para informar a senha. Como agir?",
    options: [
      "Consultar a conta pelo aplicativo ou site oficial do serviço.",
      "Abrir o link se a mensagem tiver o logotipo do serviço.",
      "Enviar a senha se a mensagem mencionar seu nome.",
    ],
    correctIndex: 0,
    explanation: "Urgência e pedido de senha são sinais de phishing. Use um canal oficial que você já conhece para verificar o aviso.",
  },
  {
    question: "Um aplicativo de lanterna pede acesso aos seus contatos. Qual é a melhor escolha?",
    options: [
      "Permitir o acesso para evitar problemas nas atualizações.",
      "Negar o acesso, pois a função do aplicativo dispensa os contatos.",
      "Dar acesso aos contatos e remover alguns nomes da agenda.",
    ],
    correctIndex: 1,
    explanation: "Conceda apenas as permissões necessárias para o recurso que você quer usar. Você pode revisar os acessos já concedidos nas configurações do aparelho.",
  },
  {
    question: "Qual combinação protege melhor suas contas se a senha de um serviço vazar?",
    options: [
      "Reutilizar uma senha longa e confiar no alerta de login.",
      "Usar o mesmo começo de senha e trocar o último número.",
      "Usar uma senha longa e única por conta e ativar a autenticação em duas etapas.",
    ],
    correctIndex: 2,
    explanation: "Senhas únicas limitam o efeito de um vazamento. A autenticação em duas etapas adiciona uma verificação ao login, mesmo se alguém descobrir a senha.",
  },
];

function initNavigation() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.getElementById(toggle?.getAttribute("aria-controls"));

  if (!toggle || !nav) return;

  const links = nav.querySelectorAll("a[href^='#']");

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  }

  function updateActiveLink() {
    const hash = window.location.hash;
    const activeHash = hash === "" || hash === "#conteudo" ? "#inicio" : hash;

    for (const link of links) {
      if (link.hash === activeHash) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    }
  }

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  for (const link of links) {
    link.addEventListener("click", () => setOpen(false));
  }

  document.addEventListener("keydown", (event) => {
    const inMenu = nav.contains(event.target) || toggle.contains(event.target);
    if (event.key === "Escape" && inMenu && toggle.getAttribute("aria-expanded") === "true") {
      event.preventDefault();
      setOpen(false);
      toggle.focus();
    }
  });

  window.addEventListener("hashchange", updateActiveLink);
  updateActiveLink();
  setOpen(false);
  nav.classList.add("is-enhanced");
  toggle.hidden = false;
}

function initObjectiveDialog() {
  const dialog = document.getElementById("objetivo-dialog");
  const triggers = document.querySelectorAll("[data-objective-open]");

  if (typeof dialog?.showModal !== "function") return;

  let openingTrigger;
  for (const trigger of triggers) {
    trigger.addEventListener("click", () => {
      openingTrigger = trigger;
      dialog.showModal();
    });
    trigger.hidden = false;
  }

  dialog.addEventListener("close", () => openingTrigger?.focus({ preventScroll: true }));
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;

    const { left, right, top, bottom } = dialog.getBoundingClientRect();
    const outside = event.clientX < left || event.clientX > right
      || event.clientY < top || event.clientY > bottom;

    if (outside) dialog.close();
  });
}

function initQuiz() {
  const quiz = document.querySelector("[data-quiz]");
  const intro = document.querySelector("[data-quiz-intro]");
  const start = document.querySelector("[data-quiz-start]");

  if (!quiz || !intro || !start) return;

  quiz.innerHTML = `
    <form class="quiz-form">
      <div class="quiz-progress">
        <p></p>
        <div class="quiz-progress-track" aria-hidden="true">
          <div class="quiz-progress-fill"></div>
        </div>
      </div>
      <h3 class="quiz-question" id="quiz-question" tabindex="-1"></h3>
      <fieldset class="quiz-options" aria-labelledby="quiz-question"></fieldset>
      <p class="quiz-feedback" id="quiz-feedback" tabindex="-1" hidden></p>
      <div class="quiz-actions">
        <button class="button button-primary" type="submit">Confirmar resposta</button>
        <button class="button button-primary" type="button" data-quiz-next hidden></button>
      </div>
    </form>
    <div class="quiz-result" hidden>
      <h3 tabindex="-1" aria-describedby="quiz-score">Resultado do quiz</h3>
      <p class="quiz-score" id="quiz-score"></p>
      <p>Você pode revisar o conteúdo e tentar de novo a qualquer momento.</p>
      <button class="button button-primary" type="button" data-quiz-restart>Refazer quiz</button>
    </div>
  `;

  const form = quiz.querySelector(".quiz-form");
  const progressLabel = quiz.querySelector(".quiz-progress p");
  const progressFill = quiz.querySelector(".quiz-progress-fill");
  const questionTitle = quiz.querySelector(".quiz-question");
  const options = quiz.querySelector(".quiz-options");
  const feedback = quiz.querySelector(".quiz-feedback");
  const confirm = form.querySelector("[type='submit']");
  const next = form.querySelector("[data-quiz-next]");
  const result = quiz.querySelector(".quiz-result");
  const resultTitle = result.querySelector("h3");
  const resultScore = result.querySelector(".quiz-score");
  const restart = result.querySelector("[data-quiz-restart]");
  let questionIndex = 0;
  let score = 0;

  function showQuestion() {
    const current = questions[questionIndex];
    const questionNumber = questionIndex + 1;
    progressLabel.textContent = `Pergunta ${questionNumber} de ${questions.length}`;
    progressFill.style.width = `${(questionNumber / questions.length) * 100}%`;
    questionTitle.textContent = current.question;
    options.replaceChildren();

    current.options.forEach((answer, index) => {
      const label = document.createElement("label");
      label.className = "quiz-option";

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "resposta";
      radio.value = String(index);
      radio.required = true;

      const key = document.createElement("span");
      key.className = "quiz-option-key";
      key.setAttribute("aria-hidden", "true");
      key.textContent = String.fromCharCode(65 + index);

      const answerText = document.createElement("span");
      answerText.className = "quiz-option-text";
      answerText.textContent = answer;

      label.append(radio, key, answerText);
      options.append(label);
    });

    options.disabled = false;
    feedback.hidden = true;
    feedback.className = "quiz-feedback";
    confirm.hidden = false;
    next.hidden = true;
    questionTitle.focus();
  }

  function beginQuiz() {
    questionIndex = 0;
    score = 0;
    intro.hidden = true;
    quiz.hidden = false;
    result.hidden = true;
    form.hidden = false;
    showQuestion();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (options.disabled) return;

    const selected = options.querySelector("input:checked");
    if (!selected) return;

    const current = questions[questionIndex];
    const correct = Number(selected.value) === current.correctIndex;

    options.children[current.correctIndex].classList.add("is-correct");
    if (correct) {
      score += 1;
    } else {
      selected.closest(".quiz-option").classList.add("is-incorrect");
    }

    options.disabled = true;
    const response = correct ? "Resposta correta." : "Resposta incorreta.";
    feedback.textContent = `${response} ${current.explanation}`;
    feedback.classList.add(correct ? "is-correct" : "is-incorrect");
    feedback.hidden = false;
    confirm.hidden = true;
    next.textContent = questionIndex === questions.length - 1 ? "Ver resultado" : "Próxima pergunta";
    next.hidden = false;
    feedback.focus();
  });

  next.addEventListener("click", () => {
    questionIndex += 1;
    if (questionIndex < questions.length) {
      showQuestion();
      return;
    }

    form.hidden = true;
    resultScore.textContent = `Você acertou ${score} de ${questions.length} perguntas.`;
    result.hidden = false;
    resultTitle.focus();
  });

  restart.addEventListener("click", beginQuiz);
  start.addEventListener("click", beginQuiz);
  start.hidden = false;
}

initNavigation();
initObjectiveDialog();
initQuiz();
