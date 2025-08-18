# Remplacez ces valeurs par celles de votre base de données Render
$PGUSER="votre_user"
$PGPASSWORD="votre_password"
$PGHOST="votre_host.render.com"
$PGPORT="5432"
$PGDATABASE="votre_database"

Write-Host "Starting database restore..."

# Restauration de la base de données
$env:PGPASSWORD = $PGPASSWORD
pg_restore --clean --if-exists --no-owner --no-privileges -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE .\arsdb.backup

Write-Host "Database restore completed!"
