<?php 
$page = "today";
require_once "partials/header.php";
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="This is a smart weather application">
  <title>Feel the Weather</title>
  <base href="/Weather_App/public/">
  <link rel="stylesheet" href="assets/css/style.css" />
</head>
<body class="main-body">
  <div class="today">
    <div class="main">
      <div class="main-1"></div>
      <div class="main-2"></div>
    </div>
    <div class="auxi">
      <div class="auxi-1"></div>
      <div class="auxi-2"></div>
    </div>
  </div>

  <footer>
    <?php require_once 'partials/footer.php'?>
  </footer>
</body>
</html>