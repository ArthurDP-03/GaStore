-- Criar database
CREATE DATABASE IF NOT EXISTS GaStore;

USE GaStore;

-- Criar tabela de usuários (TABELA 1)
CREATE TABLE
    Usuario (
        id_usuario INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        cpf VARCHAR(14) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        dtnasc DATE NOT NULL,
        tipo ENUM ('cliente', 'admin') DEFAULT 'cliente'
    ) ENGINE = InnoDB;

-- Criar tabela de categorias (TABELA 2)
CREATE TABLE
    Categoria (
        id_categoria INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(50) NOT NULL,
        descricao TEXT
    ) ENGINE = InnoDB;

-- Criar tabela de produtos (TABELA 3)
CREATE TABLE
    Produto (
        id_produto INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(150) NOT NULL,
        capa VARCHAR(255),
        preco_atual DECIMAL(10, 2) NOT NULL,
        descricao TEXT,
        id_categoria INT,
        ativo BOOLEAN DEFAULT 1, -- NOVO: Para "Soft Delete" (1 = Ativo, 0 = Inativo)
        CONSTRAINT fk_produto_categoria FOREIGN KEY (id_categoria) REFERENCES Categoria (id_categoria)
    ) ENGINE = InnoDB;

-- Criar tabela de Cupons de Desconto (TABELA 8)
CREATE TABLE CupomDesconto (
    id_cupom INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL, -- Ex: 'BEMVINDO10'
    tipo_desconto ENUM('percentual', 'fixo') NOT NULL,
    valor DECIMAL(10, 2) NOT NULL, -- Valor (10.00 para 10% ou R$10,00)
    data_validade DATE NOT NULL,
    usos_restantes INT DEFAULT 100
) ENGINE = InnoDB;

-- Criar tabela de compras (TABELA 4)
CREATE TABLE
    Compra (
        id_compra INT AUTO_INCREMENT PRIMARY KEY,
        id_usuario INT NOT NULL,
        data_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        valor_total DECIMAL(10, 2) NOT NULL,
        id_cupom INT NULL, -- NOVO: Para rastrear o cupom usado
        CONSTRAINT fk_compra_usuario FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario),
        CONSTRAINT fk_compra_cupom FOREIGN KEY (id_cupom) REFERENCES CupomDesconto (id_cupom) -- NOVO: Ligação com a tabela de cupons
    ) ENGINE = InnoDB;

-- Criar tabela de itens da compra (TABELA 5)
CREATE TABLE
    ItemCompra (
        id_compra INT NOT NULL,
        id_produto INT NOT NULL,
        quantidade INT NOT NULL DEFAULT 1,
        preco_unitario DECIMAL(10, 2) NOT NULL,
        PRIMARY KEY (id_compra, id_produto),
        CONSTRAINT fk_itemcompra_compra FOREIGN KEY (id_compra) REFERENCES Compra (id_compra) ON DELETE CASCADE,
        CONSTRAINT fk_itemcompra_produto FOREIGN KEY (id_produto) REFERENCES Produto (id_produto)
        -- A restrição aqui está correta (ON DELETE RESTRICT por padrão).
        -- Nunca excluiremos um produto, apenas o marcaremos como 'ativo = 0'.
    ) ENGINE = InnoDB;

-- ========================================================================
-- == INÍCIO DAS 3 NOVAS TABELAS (TOTALIZANDO 8) ==
-- ========================================================================

-- Criar tabela de Avaliação da Compra (TABELA 6)
CREATE TABLE AvaliacaoCompra (
    id_avaliacao INT AUTO_INCREMENT PRIMARY KEY,
    id_compra INT NOT NULL,
    id_usuario INT NOT NULL,
    nota INT NOT NULL, -- Nota de 1 a 5 para a experiência da compra
    comentario TEXT,
    data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_aval_compra FOREIGN KEY (id_compra) REFERENCES Compra (id_compra) ON DELETE CASCADE,
    CONSTRAINT fk_aval_usuario_compra FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario) ON DELETE CASCADE
) ENGINE = InnoDB;

-- Criar tabela de Lista de Desejos (Wishlist) (TABELA 7)
CREATE TABLE Wishlist (
    id_usuario INT NOT NULL,
    id_produto INT NOT NULL,
    data_adicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Chave primária composta: um usuário só pode ter um produto na lista uma vez
    PRIMARY KEY (id_usuario, id_produto), 
    
    CONSTRAINT fk_wishlist_usuario FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_produto FOREIGN KEY (id_produto) REFERENCES Produto (id_produto) ON DELETE CASCADE
) ENGINE = InnoDB;


-- ========================================================================
-- == FIM DAS NOVAS TABELAS ==
-- ========================================================================


-- INSERTS DE DADOS EXISTENTES (USUÁRIOS)
INSERT INTO
    usuario (nome, cpf, email, senha, dtnasc, tipo)
VALUES
    (
        'Administrador',
        '123.456.789-00',
        'admin@email.com',
        '$2y$10$xytybADZecNaatwoFvlzEuHv3jfQP9SQnKR2K.pUa3mAlxmmpbFRO',
        '2000-01-01',
        'admin'
    );

INSERT INTO
    usuario (nome, cpf, email, senha, dtnasc, tipo)
VALUES
    (
        'Usuario',
        '123.456.789-11',
        'usuario@email.com',
        '$2y$10$xytybADZecNaatwoFvlzEuHv3jfQP9SQnKR2K.pUa3mAlxmmpbFRO',
        '2000-01-01',
        'cliente'
    );


-- INSERTS DE DADOS EXISTENTES (CATEGORIAS)
INSERT INTO
    Categoria (nome, descricao)
VALUES
    (
        'Ação',
        'Jogos que enfatizam desafios físicos, incluindo coordenação e reflexos.'
    ),
    (
        'Mundo Aberto',
        'Jogos que apresentam um vasto mundo explorável não linear.'
    ),
    (
        'RPG',
        'Jogos focados em progressão de personagem e narrativa.'
    ),
    (
        'Aventura',
        'Jogos com foco em exploração e solução de quebra-cabeças, muitas vezes com narrativa.'
    ),
    (
        'FPS',
        'Jogos de tiro em primeira pessoa, onde o jogador vê através dos olhos do personagem.'
    ),
    (
        'Estratégia',
        'Jogos que exigem planejamento cuidadoso e habilidade tática (inclui RTS, TBS e MOBAs).'
    ),
    (
        'Esportes',
        'Jogos baseados em esportes reais ou fantásticos, com grande público cativo.'
    ),
    (
        'Simulação',
        'Jogos que replicam atividades do mundo real (de fazendas a voos).'
    ),
    (
        'Sobrevivência',
        'Jogos onde o objetivo é coletar recursos e sobreviver em um ambiente hostil.'
    ),
    (
        'Plataforma',
        'Jogos que envolvem pular entre plataformas suspensas e evitar obstáculos.'
    ),
    (
        'Terror',
        'Jogos designados para assustar o jogador, com uma base de fãs dedicada.'
    ),
    (
        'Indie',
        'Jogos criados por equipes pequenas ou desenvolvedores independentes.'
    ),
    (
        'Corrida',
        'Jogos focados em competições de veículos.'
    ),
    (
        'Luta',
        'Jogos de combate corpo a corpo entre dois ou mais personagens.'
    ),
    (
        'MMORPG',
        'Jogos de RPG online massivos para múltiplos jogadores.'
    ),
    (
        'Puzzle',
        'Jogos que se concentram na resolução de quebra-cabeças lógicos.'
    ),
    (
        'Casual',
        'Jogos com regras simples e jogabilidade acessível para sessões curtas.'
    ),
    (
        'TPS',
        'Jogos de tiro em terceira pessoa, com a câmera posicionada atrás do personagem.'
    ),
    (
        'JRPG',
        'Jogos de RPG com estilo e mecânicas tradicionalmente japonesas.'
    ),
    (
        'Roguelike',
        'Jogos com geração procedural de níveis e geralmente morte permanente.'
    ),
    (
        'Sandbox',
        'Jogos que oferecem grande liberdade ao jogador para criar e modificar o mundo.'
    ),
    (
        'Ritmo',
        'Jogos focados em música e coordenação rítmica.'
    ),
    (
        'Hack and Slash',
        'Jogos de ação focados em combate corpo a corpo intenso contra muitos inimigos.'
    ),
    (
        'Stealth',
        'Jogos onde o objetivo é evitar a detecção pelo inimigo.'
    ),
    (
        'Metroidvania',
        'Jogos de plataforma e aventura com um grande mapa interconectado.'
    ),
    (
        'Visual Novel',
        'Jogos narrativos com foco principal na história e diálogos.'
    ),
    (
        'Battle Royale',
        'Jogos online onde múltiplos jogadores lutam até que reste apenas um.'
    ),
    (
        'Construção de Cidades',
        'Jogos de simulação focados em criar e gerenciar uma cidade.'
    ),
    (
        'Point-and-Click',
        'Jogos de aventura gráfica onde a interação é feita clicando em objetos.'
    ),
    (
        'Outros',
        'Jogos ou itens que não se encaixam nas categorias principais.'
    );

-- INSERTS DE DADOS EXISTENTES (PRODUTOS)
/*ediat caminhossss    _________________________________________________________________*/
INSERT INTO
    Produto (
        titulo,
        capa,
        preco_atual,
        descricao,
        id_categoria
    )
VALUES
    -- Categoria 1: Ação
    (
        'Sekiro: Shadows Die Twice',
        'capas/sekiro.jpg',
        199.99,
        'Tome vingança. Restaure sua honra. Mate astuciosamente.',
        1
    ),
    (
        'God of War Ragnarök',
        'capas/gow_ragnarok.jpg',
        349.90,
        'Kratos e Atreus buscam respostas enquanto as forças de Asgard se preparam para a guerra.',
        1
    ),
    -- Categoria 2: Mundo Aberto
    (
        'Grand Theft Auto V',
        'capas/gta_v.jpg',
        109.90,
        'Três criminosos muito diferentes arriscam tudo em uma série de assaltos ousados.',
        2
    ),
    (
        'The Witcher 3: Wild Hunt',
        'capas/witcher_3.jpg',
        129.99,
        'Cace monstros como Geralt de Rivia, um bruxo profissional.',
        2
    ),
    -- Categoria 3: RPG
    (
        'Baldur''s Gate 3',
        'capas/baldurs_gate_3.jpg',
        199.99,
        'Reúna seu grupo e retorne aos Reinos Esquecidos em uma história de companheirismo e traição.',
        3
    ),
    (
        'The Elder Scrolls V: Skyrim',
        'capas/skyrim.jpg',
        149.00,
        'Um jogo de fantasia épico em mundo aberto onde você pode ser quem quiser.',
        3
    ),
    -- Categoria 4: Aventura
    (
        'The Last of Us Part II',
        'capas/tlou_2.jpg',
        199.50,
        'Cinco anos depois, uma jornada brutal por vingança em um mundo pós-pandêmico.',
        4
    ),
    (
        'Marvel''s Spider-Man 2',
        'capas/spiderman_2.jpg',
        349.90,
        'Peter Parker e Miles Morales enfrentam o teste final para salvar a cidade de Venom.',
        4
    ),
    -- Categoria 5: FPS
    (
        'Counter-Strike 2',
        'capas/cs2.jpg',
        79.99,
        'O próximo capítulo de um dos jogos de tiro tático em primeira pessoa mais icônicos.',
        5
    ),
    (
        'DOOM Eternal',
        'capas/doom_eternal.jpg',
        149.50,
        'Salve a humanidade rasgando e dilacerando demônios em uma campanha épica.',
        5
    ),
    -- Categoria 6: Estratégia
    (
        'StarCraft II',
        'capas/starcraft_2.jpg',
        69.90,
        'Um jogo de estratégia em tempo real no espaço, com três raças únicas e complexas.',
        6
    ),
    (
        'Civilization VI',
        'capas/civilization_6.jpg',
        89.90,
        'Construa um império para resistir ao teste do tempo, expandindo sua civilização da pedra à era espacial.',
        6
    ),
    -- Categoria 7: Esportes
    (
        'EA Sports FC 24',
        'capas/fc_24.jpg',
        359.00,
        'O futuro do futebol com realismo incomparável e mais de 19.000 jogadores licenciados.',
        7
    ),
    (
        'NBA 2K24',
        'capas/nba_2k24.jpg',
        299.90,
        'Experimente a cultura do basquete no mais novo título da aclamada série NBA 2K.',
        7
    ),
    -- Categoria 8: Simulação
    (
        'Microsoft Flight Simulator',
        'capas/ms_flight_sim.jpg',
        249.95,
        'Pilote aviões detalhados em um mundo incrivelmente realista, da aviação leve a jatos comerciais.',
        8
    ),
    (
        'The Sims 4',
        'capas/the_sims_4.jpg',
        0.00,
        'Crie e controle pessoas em um mundo virtual onde não há regras.',
        8
    ),
    -- Categoria 9: Sobrevivência
    (
        'Rust',
        'capas/rust.jpg',
        109.99,
        'O único objetivo é sobreviver. Supere a fome, a sede e o frio, e cuidado com outros jogadores.',
        9
    ),
    (
        'Valheim',
        'capas/valheim.jpg',
        37.99,
        'Um brutal jogo de sobrevivência e exploração para 1 a 10 jogadores, ambientado em um purgatório gerado proceduralmente.',
        9
    ),
    -- Categoria 10: Plataforma
    (
        'Super Mario Odyssey',
        'capas/mario_odyssey.jpg',
        299.00,
        'Junte-se a Mario em uma massiva aventura 3D global usando suas novas habilidades.',
        10
    ),
    (
        'Celeste',
        'capas/celeste.jpg',
        36.99,
        'Ajude Madeline a sobreviver em sua jornada até o topo da Montanha Celeste neste jogo de plataforma.',
        10
    ),
    -- Categoria 11: Terror
    (
        'Resident Evil 4 (Remake)',
        'capas/re4_remake.jpg',
        249.00,
        'Leon S. Kennedy é enviado em uma missão para resgatar a filha do presidente em um vilarejo europeu.',
        11
    ),
    (
        'Alien: Isolation',
        'capas/alien_isolation.jpg',
        109.99,
        'Quinze anos após os eventos de Alien, a filha de Ellen Ripley, Amanda, entra em uma batalha desesperada pela sobrevivência.',
        11
    ),
    -- Categoria 12: Indie
    (
        'Hollow Knight',
        'capas/hollow_knight.jpg',
        28.99,
        'Explore um vasto reino em ruínas de insetos e heróis em um jogo de ação e aventura 2D.',
        12
    ),
    (
        'Undertale',
        'capas/undertale.jpg',
        19.99,
        'Um RPG onde você não precisa destruir ninguém.',
        12
    ),
    -- Categoria 13: Corrida
    (
        'Forza Horizon 5',
        'capas/forza_5.jpg',
        249.00,
        'Lidere expedições de tirar o fôlego pelas paisagens vibrantes e em constante evolução do México.',
        13
    ),
    (
        'Gran Turismo 7',
        'capas/gt7.jpg',
        299.90,
        'O simulador de corrida real retorna, celebrando 25 anos de história automotiva.',
        13
    ),
    -- Categoria 14: Luta
    (
        'Mortal Kombat 1',
        'capas/mk1.jpg',
        279.90,
        'Descubra um universo renascido de Mortal Kombat criado pelo Deus do Fogo Liu Kang.',
        14
    ),
    (
        'Street Fighter 6',
        'capas/sf6.jpg',
        249.00,
        'Domine as ruas no próximo passo da evolução da lendária série de jogos de luta.',
        14
    ),
    -- Categoria 15: MMORPG
    (
        'World of Warcraft',
        'capas/wow.jpg',
        79.90,
        'Entre no massivo mundo online de Azeroth e junte-se a milhões de jogadores nesta saga épica.',
        15
    ),
    (
        'Final Fantasy XIV',
        'capas/ffxiv.jpg',
        59.90,
        'Junte-se à resistência e lute pela liberdade de Eorzea neste aclamado MMORPG.',
        15
    ),
    -- Categoria 16: Puzzle
    (
        'Portal 2',
        'capas/portal_2.jpg',
        20.69,
        'Um jogo de quebra-cabeça em primeira pessoa aclamado pela crítica, com física inovadora e uma história envolvente.',
        16
    ),
    (
        'Tetris Effect: Connected',
        'capas/tetris_effect.jpg',
        75.99,
        'Tetris como você nunca viu, ouviu ou sentiu antes.',
        16
    ),
    -- Categoria 17: Casual
    (
        'Among Us',
        'capas/among_us.jpg',
        10.89,
        'Um jogo de trabalho em equipe e traição no espaço para 4-15 jogadores.',
        17
    ),
    (
        'Fall Guys',
        'capas/fall_guys.jpg',
        0.00,
        'Compita com hordas de competidores em um pandemônio online até que reste um vencedor.',
        17
    ),
    -- Categoria 18: TPS
    (
        'Red Dead Redemption 2',
        'capas/rdr2.jpg',
        249.00,
        'A história de Arthur Morgan e a gangue Van der Linde no fim da era do Velho Oeste.',
        18
    ),
    (
        'Gears 5',
        'capas/gears_5.jpg',
        129.00,
        'Com a guerra total se aproximando, Kait Diaz foge para descobrir sua conexão com o inimigo.',
        18
    ),
    -- Categoria 19: JRPG
    (
        'Persona 5 Royal',
        'capas/persona_5.jpg',
        299.90,
        'Use a máscara dos Phantom Thieves e mude o coração dos corruptos em Tóquio.',
        19
    ),
    (
        'Dragon Quest XI S',
        'capas/dq_xi.jpg',
        169.90,
        'Embarque em uma grande aventura como o Luminar, o herói escolhido para salvar o mundo de Erdrea.',
        19
    ),
    -- Categoria 20: Roguelike
    (
        'Hades',
        'capas/hades.jpg',
        47.49,
        'Desafie o deus dos mortos enquanto você hackeia e corta para fora do Submundo.',
        20
    ),
    (
        'Slay the Spire',
        'capas/slay_the_spire.jpg',
        47.49,
        'Uma fusão de construção de baralhos de cartas e roguelike em uma subida de torre.',
        20
    ),
    -- Categoria 21: Sandbox
    (
        'Terraria',
        'capas/terraria.jpg',
        19.99,
        'Cave, lute, explore, construa! O próprio mundo está ao seu alcance.',
        21
    ),
    (
        'Garry''s Mod',
        'capas/gmod.jpg',
        20.69,
        'Um sandbox de física. Não há objetivos ou metas predefinidas. Nós damos as ferramentas, você faz o resto.',
        21
    ),
    -- Categoria 22: Ritmo
    (
        'Beat Saber',
        'capas/beat_saber.jpg',
        57.99,
        'Um jogo de ritmo VR onde você corta batidas musicais com sabres de luz.',
        22
    ),
    (
        'Hi-Fi Rush',
        'capas/hifi_rush.jpg',
        109.00,
        'Sinta a batida enquanto o aspirante a estrela Chai e sua equipe lutam contra uma megacorporação maligna.',
        22
    ),
    -- Categoria 23: Hack and Slash
    (
        'Diablo IV',
        'capas/diablo_4.jpg',
        349.90,
        'A batalha sem fim entre o Paraíso Celestial e o Inferno Ardente continua.',
        23
    ),
    (
        'Bayonetta 3',
        'capas/bayonetta_3.jpg',
        299.00,
        'A bruxa Umbra retorna, mais poderosa do que nunca, para lutar contra homúnculos misteriosos.',
        23
    ),
    -- Categoria 24: Stealth
    (
        'Metal Gear Solid V: The Phantom Pain',
        'capas/mgs_v.jpg',
        75.00,
        'O lendário herói Snake é forçado a um mundo aberto, em uma missão por vingança.',
        24
    ),
    (
        'Dishonored 2',
        'capas/dishonored_2.jpg',
        119.90,
        'Jogue como um assassino sobrenatural em um mundo onde misticismo e indústria colidem.',
        24
    ),
    -- Categoria 25: Metroidvania
    (
        'Metroid Dread',
        'capas/metroid_dread.jpg',
        299.00,
        'Samus Aran é caçada por um novo e mortal robô E.M.M.I. em um planeta alienígena.',
        25
    ),
    (
        'Ori and the Will of the Wisps',
        'capas/ori_2.jpg',
        129.00,
        'Embarque em uma nova jornada em um mundo vasto e exótico cheio de inimigos e quebra-cabeças.',
        25
    ),
    -- Categoria 26: Visual Novel
    (
        'Doki Doki Literature Club!',
        'capas/doki_doki.jpg',
        28.99,
        'Junte-se ao clube de literatura e encontre o romance perfeito... ou algo mais sombrio.',
        26
    ),
    (
        'Steins;Gate Elite',
        'capas/steins_gate.jpg',
        113.99,
        'Uma visual novel de aventura e viagem no tempo totalmente animada.',
        26
    ),
    -- Categoria 27: Battle Royale
    (
        'Fortnite',
        'capas/fortnite.jpg',
        0.00,
        'O popular jogo de batalha real onde você constrói e luta para ser o último de pé.',
        27
    ),
    (
        'Apex Legends',
        'capas/apex_legends.jpg',
        0.00,
        'Um jogo de tiro de heróis gratuito onde competidores lendários lutam por glória e fortuna.',
        27
    ),
    -- Categoria 28: Construção de Cidades
    (
        'Cities: Skylines II',
        'capas/cities_skylines_2.jpg',
        179.99,
        'Construa a cidade dos seus sonhos com o construtor de cidades mais realista de todos os tempos.',
        28
    ),
    (
        'Anno 1800',
        'capas/anno_1800.jpg',
        179.90,
        'Lidere a Revolução Industrial e construa um império industrial.',
        28
    ),
    -- Categoria 29: Point-and-Click
    (
        'Return to Monkey Island',
        'capas/return_monkey_island.jpg',
        47.49,
        'O retorno inesperado do criador da série, Ron Gilbert, continua a história do lendário pirata Guybrush Threepwood.',
        29
    ),
    (
        'Grim Fandango Remastered',
        'capas/grim_fandango.jpg',
        28.99,
        'Uma aventura épica de Manny Calavera, agente de viagens no Departamento da Morte.',
        29
    ),
    -- Categoria 30: Outros
    (
        'Wii Sports',
        'capas/wii_sports.jpg',
        199.00,
        'Uma coleção de cinco simulações esportivas (Tênis, Beisebol, Boliche, Golfe e Boxe).',
        30
    ),
    (
        'Jackbox Party Pack 9',
        'capas/jackbox_9.jpg',
        59.90,
        'A nona edição da popular série de jogos de festa, perfeita para grupos.',
        30
    );

-- ========================================================================
-- == INSERTS DE DADOS DE EXEMPLO PARA AS NOVAS TABELAS ==
-- ========================================================================

-- Inserir alguns cupons de exemplo
INSERT INTO CupomDesconto (codigo, tipo_desconto, valor, data_validade, usos_restantes) 
VALUES 
('BEMVINDO10', 'percentual', 10.00, '2026-12-31', 1000),
('GASTORE5', 'fixo', 5.00, '2026-06-30', 500);