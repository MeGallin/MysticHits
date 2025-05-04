# Set the source and destination folders
src_folder=./dist/
dst_folder=../../../../live/mystichits/

#Check if the destination folder exists
if [ ! -d "$dst_folder" ]; then
  echo "Error: The destination folder $dst_folder does not exist."
  exit 1
  else
  rm -rf "$dst_folder"/*
fi

# Check if the source folder exists
if [ ! -d "$src_folder" ]; then
  echo "Error: The source folder $src_folder does not exist."
  exit 1
  else
  cp -r "$src_folder"/* "$dst_folder"/
  echo "Files copied successfully!"
  exit 1
fi

