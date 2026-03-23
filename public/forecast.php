<?php 
$page = "forecast";
require_once "partials/header.php";
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <base href="/Weather_App/public/">
</head>
<body class="main-body">
  <main>
    <div class="forecast">
      <div class="forecast-1">
        <div class="cityContainer"></div>
        <div class="dayContainer"></div>
        <div class="dayContainer"></div>
        <div class="dayContainer"></div>
        <div class="dayContainer"></div>
        <div class="dayContainer"></div>
        <div class="dayContainer"></div>
        <div class="dayContainer"></div>
      </div>
      <div class="forecast-2"></div>
    </div>
  </main>
  
  <footer>
    <?php require_once 'partials/footer.html'?>
  </footer>
</body>
</html>