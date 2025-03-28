from django.core.management.base import BaseCommand
from shop.models import ComparisonList
from django.db.models import Count
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Cleans up duplicate ComparisonList objects'

    def handle(self, *args, **options):
        # Find users with multiple comparison lists
        users_with_duplicates = ComparisonList.objects.values('user').annotate(
            count=Count('id')
        ).filter(count__gt=1).exclude(user=None)
        
        self.stdout.write(f"Found {users_with_duplicates.count()} users with multiple comparison lists")
        
        # Process duplicates for each user
        for user_data in users_with_duplicates:
            user_id = user_data['user']
            if not user_id:
                continue
                
            # Get all comparison lists for this user, ordered by last update
            lists = ComparisonList.objects.filter(user_id=user_id).order_by('-updated_at')
            
            # Keep the most recently updated one
            primary_list = lists.first()
            duplicate_count = lists.count() - 1
            
            self.stdout.write(f"User {user_id}: Merging {duplicate_count} lists into list {primary_list.id}")
            
            # Migrate all products from other lists to the primary list
            for cl in lists[1:]:  # Skip the first one (primary)
                # Get product IDs from this list
                product_ids = cl.products.values_list('id', flat=True)
                
                # Add them to the primary list
                for product_id in product_ids:
                    primary_list.products.add(product_id)
                
                # Delete the duplicate list
                cl_id = cl.id
                cl.delete()
                self.stdout.write(f"  - Deleted list {cl_id}")
            
            # Update the timestamp
            primary_list.save()
        
        self.stdout.write(self.style.SUCCESS('Successfully cleaned up duplicate comparison lists'))
