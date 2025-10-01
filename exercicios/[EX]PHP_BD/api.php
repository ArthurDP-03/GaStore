<?php
//Coloca sua senha e sua dataBAse ai Prof! Tamo junto!
$conn = mysqli_connect("localhost:3306", "root", "", "");

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    $r = mysqli_query($conn, "select * from musica;");
    while ($row = mysqli_fetch_assoc($r)) {
        echo $row["id_musica"] ."-". $row["titulo"] . " | Duração: " . $row["duracao"] . " | Compositor: " . $row["compositor"] . " | Álbum: " . $row["album"] . "<br>";
    }
}
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $titulo = $_POST["titulo"];
    $duracao = $_POST["duracao"];
    $compositor = $_POST["compositor"];
    $album = $_POST["album"];
    $stmt = $conn->prepare("INSERT INTO musica (titulo, duracao, compositor, album) VALUES (?,?,?,?)");
    $stmt->bind_param("sdss",$titulo, $duracao,$compositor,$album);
    if ($stmt->execute()) {
        echo "música cadastrada com sucesso";
        header("Location: index.html");
        exit();
    }
}

?>