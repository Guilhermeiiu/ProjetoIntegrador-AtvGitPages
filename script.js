'use strict';

var ITENS_POR_PAGINA = 8;
var CHAVE_CARRINHO = 'boom_cart_simples';
var slideAtual = 0;

var produtos = [];
var carrinho = [];
var categoriaAtual = 'todos';
var buscaAtual = '';
var quantidadeVisivel = ITENS_POR_PAGINA;
var produtoAberto = null;
var ultimoFoco = null;

var body;
var cartToggle;
var cartBadge;
var cartSidebar;
var cartClose;
var cartOverlay;
var cartItems;
var cartFooter;
var cartCount;
var cartTotal;
var checkoutBtn;
var filterPills;
var searchCatalog;
var catalogStatus;
var catalogActions;
var catalogFeedback;
var productModal;
var prodModalImg;
var heroDots;
var prodModalBadge;
var prodModalName;
var prodModalPrice;
var prodModalMeta;
var prodModalDesc;
var prodModalAddBtn;
var prodModalClose;

document.addEventListener('DOMContentLoaded', iniciarSite);
document.addEventListener('keydown', controlarTeclado);

function iniciarSite() {
  guardarElementos();
  carregarProdutosDoHTML();
  carregarCarrinho();
  ligarEventos();
  atualizarCarrinho();
  atualizarCatalogo();
  iniciarCarrossel();
}

function guardarElementos() {
  body = document.body;
  cartToggle = document.getElementById('cartToggle');
  cartBadge = document.getElementById('cartBadge');
  cartSidebar = document.getElementById('cartSidebar');
  cartClose = document.getElementById('cartClose');
  cartOverlay = document.getElementById('cartOverlay');
  cartItems = document.getElementById('cartItems');
  cartFooter = document.getElementById('cartFooter');
  cartCount = document.getElementById('cartCount');
  cartTotal = document.getElementById('cartTotal');
  checkoutBtn = document.getElementById('checkoutBtn');
  filterPills = document.getElementById('filterPills');
  searchCatalog = document.getElementById('searchCatalog');
  catalogStatus = document.getElementById('catalogStatus');
  catalogActions = document.getElementById('catalogActions');
  catalogFeedback = document.getElementById('catalogFeedback');
  heroDots = document.getElementById('heroDots');
  productModal = document.getElementById('productModal');
  prodModalImg = document.getElementById('prodModalImg');
  prodModalBadge = document.getElementById('prodModalBadge');
  prodModalName = document.getElementById('prodModalName');
  prodModalPrice = document.getElementById('prodModalPrice');
  prodModalMeta = document.getElementById('prodModalMeta');
  prodModalDesc = document.getElementById('prodModalDesc');
  prodModalAddBtn = document.getElementById('prodModalAddBtn');
  prodModalClose = document.getElementById('prodModalClose');
}

function carregarProdutosDoHTML() {
  var cards = document.querySelectorAll('.prod');

  for (var i = 0; i < cards.length; i++) {
    var card = cards[i];
    var produto = {
      id: Number(card.getAttribute('data-id')),
      name: card.getAttribute('data-name'),
      cat: card.getAttribute('data-cat'),
      img: card.getAttribute('data-img'),
      price: Number(card.getAttribute('data-price')),
      badge: card.getAttribute('data-badge'),
      badgeLabel: card.getAttribute('data-badge-label'),
      meta: card.getAttribute('data-meta'),
      desc: card.getAttribute('data-desc'),
      card: card
    };

    produto.busca = (
      produto.name + ' ' +
      produto.cat + ' ' +
      produto.meta + ' ' +
      produto.desc + ' ' +
      produto.badgeLabel
    ).toLowerCase();

    produtos.push(produto);
    ligarEventosDoProduto(card);
  }
}

function iniciarCarrossel() {
  var slides = document.querySelectorAll('.slide');

  if (!slides.length || !heroDots) {
    return;
  }

  heroDots.innerHTML = '';

  for (var i = 0; i < slides.length; i++) {
    criarBolinhaSlide(i);
  }

  document.getElementById('heroPrev').addEventListener('click', function () {
    mudarSlide(slideAtual - 1);
  });

  document.getElementById('heroNext').addEventListener('click', function () {
    mudarSlide(slideAtual + 1);
  });

}

function criarBolinhaSlide(indice) {
  var bolinha = document.createElement('button');
  bolinha.className = indice === 0 ? 'hdot active' : 'hdot';
  bolinha.setAttribute('type', 'button');
  bolinha.setAttribute('aria-label', 'Ir para o slide ' + (indice + 1));
  bolinha.addEventListener('click', function () {
    mudarSlide(indice);
  });
  heroDots.appendChild(bolinha);
}

function mudarSlide(indice) {
  var slides = document.querySelectorAll('.slide');
  var bolinhas = heroDots.querySelectorAll('.hdot');

  if (!slides.length) {
    return;
  }

  slides[slideAtual].classList.remove('active');
  bolinhas[slideAtual].classList.remove('active');

  if (indice < 0) {
    indice = slides.length - 1;
  }

  if (indice >= slides.length) {
    indice = 0;
  }

  slideAtual = indice;
  slides[slideAtual].classList.add('active');
  bolinhas[slideAtual].classList.add('active');
}


function ligarEventosDoProduto(card) {
  var botaoAdicionar = card.querySelector('.prod-add');

  if (botaoAdicionar) {
    botaoAdicionar.addEventListener('click', function (event) {
      event.stopPropagation();
      adicionarAoCarrinho(Number(card.getAttribute('data-id')));
    });
  }

  card.addEventListener('click', function () {
    abrirModal(Number(card.getAttribute('data-id')));
  });

  card.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      abrirModal(Number(card.getAttribute('data-id')));
    }
  });
}

function ligarEventos() {
  if (cartToggle) {
    cartToggle.addEventListener('click', abrirCarrinho);
  }

  if (cartClose) {
    cartClose.addEventListener('click', fecharCarrinho);
  }

  if (cartOverlay) {
    cartOverlay.addEventListener('click', fecharCarrinho);
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', finalizarWhatsApp);
  }

  if (filterPills) {
    var botoesFiltro = filterPills.querySelectorAll('.fpill');

    for (var i = 0; i < botoesFiltro.length; i++) {
      botoesFiltro[i].addEventListener('click', trocarCategoria);
    }
  }

  if (searchCatalog) {
    searchCatalog.addEventListener('input', function () {
      buscaAtual = searchCatalog.value.toLowerCase().trim();
      quantidadeVisivel = ITENS_POR_PAGINA;
      atualizarCatalogo();
    });
  }

  if (catalogActions) {
    catalogActions.addEventListener('click', carregarMaisProdutos);
  }

  if (prodModalClose) {
    prodModalClose.addEventListener('click', function () {
      fecharModal(true);
    });
  }

  if (productModal) {
    productModal.addEventListener('click', function (event) {
      if (event.target.getAttribute('data-action') === 'close-modal') {
        fecharModal(true);
      }
    });
  }

  if (prodModalAddBtn) {
    prodModalAddBtn.addEventListener('click', function () {
      if (produtoAberto) {
        var id = produtoAberto.id;
        fecharModal(false);
        adicionarAoCarrinho(id);
      }
    });
  }
}

function trocarCategoria() {
  categoriaAtual = this.getAttribute('data-cat') || 'todos';
  quantidadeVisivel = ITENS_POR_PAGINA;
  atualizarBotoesFiltro();
  atualizarCatalogo();
}

function atualizarBotoesFiltro() {
  var botoes = filterPills.querySelectorAll('.fpill');

  for (var i = 0; i < botoes.length; i++) {
    var botao = botoes[i];
    var ativo = botao.getAttribute('data-cat') === categoriaAtual;

    if (ativo) {
      botao.classList.add('active');
      botao.setAttribute('aria-pressed', 'true');
    } else {
      botao.classList.remove('active');
      botao.setAttribute('aria-pressed', 'false');
    }
  }
}

function atualizarCatalogo() {
  var total = 0;
  var exibidos = 0;

  for (var i = 0; i < produtos.length; i++) {
    var produto = produtos[i];
    var categoriaOk = categoriaAtual === 'todos' || produto.cat === categoriaAtual;
    var buscaOk = buscaAtual === '' || produto.busca.indexOf(buscaAtual) >= 0;
    var deveAparecer = categoriaOk && buscaOk;

    if (deveAparecer) {
      total++;
    }

    if (deveAparecer && exibidos < quantidadeVisivel) {
      produto.card.style.display = '';
      exibidos++;
    } else {
      produto.card.style.display = 'none';
    }
  }

  atualizarMensagemCatalogo(total, exibidos);
  atualizarBotaoVerMais(total, exibidos);
}

function atualizarMensagemCatalogo(total, exibidos) {
  var nomeCategoria = rotuloCategoria(categoriaAtual);

  if (catalogFeedback) {
    catalogFeedback.hidden = total !== 0;
  }

  if (!catalogStatus) {
    return;
  }

  if (total === 0) {
    if (buscaAtual) {
      catalogStatus.textContent = 'Nenhum resultado para "' + buscaAtual + '".';
    } else {
      catalogStatus.textContent = 'Nenhum produto em ' + nomeCategoria + '.';
    }

    return;
  }

  if (exibidos < total) {
    catalogStatus.textContent = exibidos + ' de ' + total + ' produtos exibidos em ' + nomeCategoria + '.';
  } else {
    catalogStatus.textContent = total + ' produtos exibidos em ' + nomeCategoria + '.';
  }
}

function atualizarBotaoVerMais(total, exibidos) {
  if (!catalogActions) {
    return;
  }

  catalogActions.innerHTML = '';

  if (exibidos >= total) {
    return;
  }

  var restantes = total - exibidos;
  catalogActions.innerHTML = '<button class="btn-load-more" type="button" data-action="load-more">Ver mais produtos (' + restantes + ')</button>';
}

function carregarMaisProdutos(event) {
  if (event.target.getAttribute('data-action') !== 'load-more') {
    return;
  }

  quantidadeVisivel += ITENS_POR_PAGINA;
  atualizarCatalogo();
}

function rotuloCategoria(categoria) {
  if (categoria === 'camisa') {
    return 'camisetas';
  }

  if (categoria === 'casaco') {
    return 'casacos';
  }

  if (categoria === 'acess') {
    return 'acessórios';
  }

  return 'todo o catálogo';
}

function carregarCarrinho() {
  var salvo = '';

  try {
    salvo = localStorage.getItem(CHAVE_CARRINHO) || '';
  } catch (erro) {
    salvo = '';
  }

  if (!salvo) {
    return;
  }

  var itens = salvo.split(';');

  for (var i = 0; i < itens.length; i++) {
    var partes = itens[i].split(':');
    var id = Number(partes[0]);
    var quantidade = Number(partes[1]);

    if (buscarProduto(id) && quantidade > 0) {
      carrinho.push({
        id: id,
        qtd: quantidade
      });
    }
  }
}

function salvarCarrinho() {
  var texto = '';

  for (var i = 0; i < carrinho.length; i++) {
    if (i > 0) {
      texto += ';';
    }

    texto += carrinho[i].id + ':' + carrinho[i].qtd;
  }

  try {
    localStorage.setItem(CHAVE_CARRINHO, texto);
  } catch (erro) {
    return;
  }
}

function adicionarAoCarrinho(id) {
  var produto = buscarProduto(id);

  if (!produto) {
    return;
  }

  var item = buscarItemCarrinho(id);

  if (item) {
    item.qtd++;
  } else {
    carrinho.push({
      id: id,
      qtd: 1
    });
  }

  salvarCarrinho();
  atualizarCarrinho();
  abrirCarrinho();
}

function removerDoCarrinho(id) {
  for (var i = 0; i < carrinho.length; i++) {
    if (carrinho[i].id === id) {
      carrinho.splice(i, 1);
      break;
    }
  }

  salvarCarrinho();
  atualizarCarrinho();
}

function alterarQuantidade(id, valor) {
  var item = buscarItemCarrinho(id);

  if (!item) {
    return;
  }

  item.qtd += valor;

  if (item.qtd < 1) {
    item.qtd = 1;
  }

  salvarCarrinho();
  atualizarCarrinho();
}

function atualizarCarrinho() {
  if (!cartItems || !cartFooter || !cartBadge || !cartCount || !cartTotal) {
    return;
  }

  var quantidadeTotal = 0;
  var valorTotal = 0;

  cartItems.innerHTML = '';

  for (var i = 0; i < carrinho.length; i++) {
    var produto = buscarProduto(carrinho[i].id);

    if (produto) {
      quantidadeTotal += carrinho[i].qtd;
      valorTotal += produto.price * carrinho[i].qtd;
      cartItems.appendChild(criarItemCarrinho(carrinho[i], produto));
    }
  }

  cartBadge.textContent = quantidadeTotal;
  cartCount.textContent = '(' + quantidadeTotal + ')';
  cartTotal.textContent = formatarDinheiro(valorTotal);

  if (carrinho.length === 0) {
    cartItems.innerHTML = '<div class="cart-empty"><p>Sua sacola está vazia</p><a href="#catalogo" data-action="close-cart" class="btn-fill-sm">Ver produtos</a></div>';
    cartFooter.hidden = true;

    var linkCatalogo = cartItems.querySelector('[data-action="close-cart"]');

    if (linkCatalogo) {
      linkCatalogo.addEventListener('click', fecharCarrinho);
    }
  } else {
    cartFooter.hidden = false;
  }
}

function criarItemCarrinho(item, produto) {
  var elemento = document.createElement('div');
  elemento.className = 'cart-item';
  elemento.setAttribute('data-id', item.id);
  elemento.innerHTML =
    '<div class="cart-item-img"><img src="' + produto.img + '" alt="' + produto.name + '" loading="lazy" decoding="async"></div>' +
    '<div class="cart-item-info">' +
      '<div class="cart-item-name">' + produto.name + '</div>' +
      '<div class="cart-item-price">' + formatarDinheiro(produto.price * item.qtd) + '</div>' +
      '<div class="cart-item-qty">' +
        '<button class="qty-btn" type="button" data-action="decrease-qty" aria-label="Diminuir quantidade">-</button>' +
        '<span class="qty-val">' + item.qtd + '</span>' +
        '<button class="qty-btn" type="button" data-action="increase-qty" aria-label="Aumentar quantidade">+</button>' +
      '</div>' +
    '</div>' +
    '<button class="cart-item-del" type="button" data-action="remove-from-cart" aria-label="Remover da sacola">✕</button>';

  elemento.querySelector('[data-action="decrease-qty"]').addEventListener('click', function () {
    alterarQuantidade(item.id, -1);
  });

  elemento.querySelector('[data-action="increase-qty"]').addEventListener('click', function () {
    alterarQuantidade(item.id, 1);
  });

  elemento.querySelector('[data-action="remove-from-cart"]').addEventListener('click', function () {
    removerDoCarrinho(item.id);
  });

  return elemento;
}

function buscarProduto(id) {
  for (var i = 0; i < produtos.length; i++) {
    if (produtos[i].id === id) {
      return produtos[i];
    }
  }

  return null;
}

function buscarItemCarrinho(id) {
  for (var i = 0; i < carrinho.length; i++) {
    if (carrinho[i].id === id) {
      return carrinho[i];
    }
  }

  return null;
}

function abrirCarrinho() {
  if (cartSidebar) {
    cartSidebar.classList.add('open');
    cartSidebar.setAttribute('aria-hidden', 'false');
  }

  if (cartOverlay) {
    cartOverlay.classList.add('show');
  }

  if (cartToggle) {
    cartToggle.setAttribute('aria-expanded', 'true');
  }

  travarTela();
}

function fecharCarrinho() {
  if (cartSidebar) {
    cartSidebar.classList.remove('open');
    cartSidebar.setAttribute('aria-hidden', 'true');
  }

  if (cartOverlay) {
    cartOverlay.classList.remove('show');
  }

  if (cartToggle) {
    cartToggle.setAttribute('aria-expanded', 'false');
  }

  travarTela();
}

function finalizarWhatsApp() {
  if (carrinho.length === 0) {
    return;
  }

  var numero = body.getAttribute('data-whatsapp') || '';
  var total = 0;
  var itens = '';

  for (var i = 0; i < carrinho.length; i++) {
    var produto = buscarProduto(carrinho[i].id);

    if (produto) {
      var subtotal = produto.price * carrinho[i].qtd;
      total += subtotal;
      itens += '- ' + produto.name + ' (' + carrinho[i].qtd + 'x) - ' + formatarDinheiro(subtotal) + '\n';
    }
  }

  var mensagem =
    'Olá! Gostaria de fazer um pedido na Boom Alternativa.\n\n' +
    itens + '\n' +
    'Total: ' + formatarDinheiro(total) + '\n\n' +
    'Aguardo instruções para pagamento e entrega. Obrigado(a)!';

  if (numero) {
    window.open('https://wa.me/' + numero + '?text=' + encodeURIComponent(mensagem), '_blank', 'noopener,noreferrer');
  } else {
    window.open(body.getAttribute('data-instagram-url') || 'https://instagram.com/boomalternativa', '_blank', 'noopener,noreferrer');
  }
}

function abrirModal(id) {
  var produto = buscarProduto(id);

  if (!produto || !productModal) {
    return;
  }

  produtoAberto = produto;
  ultimoFoco = document.activeElement;

  prodModalImg.innerHTML = '<img src="' + produto.img + '" alt="' + produto.name + '" loading="lazy" decoding="async">';
  prodModalName.textContent = produto.name;
  prodModalPrice.textContent = formatarDinheiro(produto.price);
  prodModalMeta.textContent = produto.meta;
  prodModalDesc.textContent = produto.desc || 'Peça autoral da Boom Alternativa.';

  if (produto.badge) {
    prodModalBadge.textContent = produto.badgeLabel;
    prodModalBadge.className = 'prod-modal-badge pb-' + produto.badge;
    prodModalBadge.hidden = false;
  } else {
    prodModalBadge.hidden = true;
  }

  productModal.classList.add('open');
  productModal.setAttribute('aria-hidden', 'false');
  travarTela();

  if (prodModalClose) {
    prodModalClose.focus();
  }
}

function fecharModal(restaurarFoco) {
  if (!productModal) {
    return;
  }

  productModal.classList.remove('open');
  productModal.setAttribute('aria-hidden', 'true');
  produtoAberto = null;
  travarTela();

  if (restaurarFoco && ultimoFoco && ultimoFoco.focus) {
    ultimoFoco.focus();
  }
}

function travarTela() {
  var carrinhoAberto = cartSidebar && cartSidebar.classList.contains('open');
  var modalAberto = productModal && productModal.classList.contains('open');

  if (carrinhoAberto || modalAberto) {
    body.classList.add('is-locked');
  } else {
    body.classList.remove('is-locked');
  }
}

function controlarTeclado(event) {
  if (event.key !== 'Escape') {
    return;
  }

  if (produtoAberto) {
    fecharModal(true);
    return;
  }

  if (cartSidebar && cartSidebar.classList.contains('open')) {
    fecharCarrinho();
  }
}

function formatarDinheiro(valor) {
  return 'R$ ' + Number(valor).toFixed(2).replace('.', ',');
}
