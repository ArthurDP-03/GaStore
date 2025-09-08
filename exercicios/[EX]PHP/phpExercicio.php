<html>
    <head>
        <title>Página de Apresentação</title>
        <style>
            button {
                background-color: #4CAF50;
                color: white;
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }
            button:hover {
                background-color: #246e28ff;
            }
        </style>
    </head>
    <body>
        <?php
        
            $nome = "Arthur";
            $idade = 22;
            $cidade = "Curitiba";

            echo "<h1>Olá, seja bem-vindo à página de $nome.</h1>";
            echo "<p>$nome tem $idade anos e mora em $cidade.</p>";


            for ($i = 0; $i < 20; $i++) {
                echo "<button>Botão $i</button> ";
            }
        ?>
    </body>
</html>

