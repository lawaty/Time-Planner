<?php

class Logger
{
  private static string $file;
  private Ndate $start_inst;

  public function __construct()
  {
    if(!file_exists(LOG))
      mkdir(LOG);

    self::$file = LOG . "/" . (new Ndate())->getDate() . ".log";
    $this->start_inst = new Ndate();
  }

  public function log($endpoint, Response $response)
  {
    if (!file_exists(self::$file))
      $fhand = fopen(self::$file, "w");
    else
      $fhand = fopen(self::$file, "a");

    $response_body = $response->getCode() > 204 ? json_encode($response->getBody()) : "success";

    if ($endpoint) {
      $endpoint_name = get_class($endpoint);
      $user = $endpoint->getUser();
      if($user)
        $user_id = $user->get('id');
      else $user_id = 0;
    } else {
      $endpoint_name = "Not Found";
      $user_id = 0;
    }

    fwrite(
      $fhand,
      $endpoint_name . " " . json_encode($_REQUEST) . " " . $response->getCode() . " " . $response_body . " " . $this->start_inst->toString() . " " . (new Ndate())->toString() . " " . $_SERVER['REMOTE_ADDR'] . " " . $user_id . "\n\n"
    );

    fclose($fhand);
  }

  public function reportError($error){
    if (!file_exists(self::$file))
      $fhand = fopen(self::$file, "w");
    else
      $fhand = fopen(self::$file, "a");

    fwrite($fhand, $error."\n\n");
    fclose($fhand);
  }
}
