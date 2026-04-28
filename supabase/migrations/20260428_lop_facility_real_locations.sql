-- Update lop_facilities with the real public address + phone for each ER, sourced
-- from the facility websites (erofwhiterock.com, erofirving.com, eroflufkin.com).
-- These values are used by /api/lop/schedule-notify so walk-in confirmations
-- include directions and a callable phone number.

UPDATE lop_facilities
   SET address = '10705 Northwest Hwy, Dallas, TX 75238',
       phone   = '(469) 943-2939',
       updated_at = NOW()
 WHERE slug = 'white-rock';

UPDATE lop_facilities
   SET address = '8200 N MacArthur Blvd Suite 110, Irving, TX 75063',
       phone   = '(972) 893-3148',
       updated_at = NOW()
 WHERE slug = 'irving';

UPDATE lop_facilities
   SET address = '501 N Brentwood Dr, Lufkin, TX 75904',
       phone   = '(936) 427-1313',
       updated_at = NOW()
 WHERE slug = 'lufkin';
