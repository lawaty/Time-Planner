<?php

class Router
{
  private static function endpointExists($controller, $endpoint): bool
  {
    // Searching for endpoint
    return file_exists("endpoints/$controller/$endpoint.php") || (!$endpoint && file_exists("endpoints/$controller/index.php"));
  }

  public static function route(): ?Endpoint
  {
    // Creates Endpoint Object If Found
    $url = 'api' . explode('/api', parse_url($_SERVER['REQUEST_URI'])['path'])[1];
    $sections = explode('/', explode('?', $url)[0]);
    $len = count($sections);
    if ($len != 2 && $len != 3)
      return null;

    $controller = strtolower($sections[1]);
    if ($len == 3) $endpoint = ucfirst($sections[2]);
    else $endpoint = null;

    if (!self::endpointExists($controller, $endpoint))
      return null;

    require("bases/Endpoint.php");

    if ($endpoint){
      require("endpoints/$controller/$endpoint.php");
      return new $endpoint;
    }
    
    require("endpoints/$controller/index.php");
    return new Get();
  }
}
