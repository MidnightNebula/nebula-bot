## add db
- type (sqlite)
- add drizzle orm
- add profiles(+coins, createdAt, updatedAt)
- remove profile from db when kicked/banned

## add coins generation feature
<!-- max 3 roles, one role is 10 pizzucoins, 1 pizzucoins = 6 pizzuslices, 3 pizzucoins/day | 30 pizzucoins/month -->
- add coins generation events
    - text channels (+1 pizzuslice every message)
    - voice activity (+3 pizzuslices every 30 minute)

## buying roles feature
- check balance
- buy role (choose hex? color + text), subtract balance
- replace roles (choose one from list)
- max 3 roles, if hit limit suggest replacing

## backup feature
- cron job, daily
- sends to google drive? the snapshot