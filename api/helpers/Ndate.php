<?php

class Ndate extends DateTime
{
  const DATE_TIME = "Y-m-d H:i";
  const DATE = "Y-m-d";
  
  private static ?Ndate $now = null;

  public function __construct(string $date = 'now')
  {
    parent::__construct($date);
  }

  public static function now(): Ndate
  {
    if (self::$now === null)
      self::$now = new self();

    return self::$now;
  }

  public static function minutesUntil(Ndate $date): int
  {
    return self::secondsUntil($date) / 60;
  }

  public static function secondsUntil(Ndate $date): int
  {
    $diff = self::now()->diff($date);
    $seconds = $diff->days * 24 * 3600 + $diff->h * 3600 + $diff->i * 60 + $diff->s;
    if(self::now() > $date)
      return $seconds * -1;

    return $seconds;
  }

  public function getDay(): string
  {
    return $this->format('D');
  }

  public function getMonth(): string
  {
    return $this->format('m');
  }

  public function getDate(): string
  {
    return $this->format(self::DATE);
  }

  public function toString($format = self::DATE_TIME): string
  {
    return $this->format(self::DATE_TIME);
  }
}
