<?php

if (!function_exists('str_contains')) {
  function str_contains(string $haystack, string $needle): bool
  {
    return '' === $needle || false !== strpos($haystack, $needle);
  }
}

require "config.php";
require "autoload.php";
require "functions.php";

require "proxy/Logger.php";
require "proxy/Router.php";
require "proxy/Response.php";

$logger = new Logger();

if (!($endpoint = Router::route())) {
  $response = new Response(NOT_FOUND, 'Endpoint Not Found');
} else {
  try {
    $response = $endpoint->run();
  } catch (Exception $e) {
    $code = is_integer($e->getCode()) ? $e->getCode() : FAIL;
    $response = new Response($code, $e->getMessage());
    if(DEBUG)
      $response = new Response($code, trace($e));
  }
}

$response->echo();
if($endpoint instanceof Endpoint)
  $endpoint->postHandle();
$logger->log($endpoint, $response);