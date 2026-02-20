drop extension if exists "pg_net";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.sync_avatar_from_provider()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$                                                                                                                                          
  declare                                                                                                                                                        
    provider_avatar text;                                                                                                                                        
  begin
    if new.avatar_url is not null then                                                                                                                           
      return new;                                                                                                                                                
    end if;                                                                                                                                                      
                                                                                                                                                                 
    select raw_user_meta_data->>'avatar_url'                                                                                                                     
      into provider_avatar                                                                                                                                       
      from auth.users                                                                                                                                            
      where id = new.id;                                                                                                                                         
                                                                                                                                                                 
    if provider_avatar is not null and provider_avatar <> '' then                                                                                                
      new.avatar_url := provider_avatar;                                                                                                                         
    end if;                                                                                                                                                      
                                                                                                                                                                 
    return new;                                                                                                                                                  
  end;                                                                                                                                                           
  $function$
;


